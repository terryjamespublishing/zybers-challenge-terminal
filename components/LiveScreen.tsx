import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as geminiService from '../services/geminiService';
import { VoiceSettings } from '../types';
import { LiveServerMessage } from '@google/genai';
import { ZYBER_LIVE_CHAT_PROMPT } from '../constants';
import TerminalWindow from './TerminalWindow';

// Type for the live session returned by connectLive
type LiveSession = Awaited<ReturnType<typeof geminiService.connectLive>>;

interface Transcription {
    user: string;
    model: string;
    isFinal: boolean;
}

interface LiveScreenProps {
    onExit: () => void;
    voiceSettings: VoiceSettings;
}

const LiveScreen: React.FC<LiveScreenProps> = ({ onExit, voiceSettings }) => {
    const [isConnecting, setIsConnecting] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
    const currentTranscriptionRef = useRef<Transcription>({ user: '', model: '', isFinal: false });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const stopAudioProcessing = useCallback(() => {
        if (audioWorkletNodeRef.current && audioContextRef.current) {
            audioWorkletNodeRef.current.port.postMessage('stop');
            audioWorkletNodeRef.current.disconnect();
            audioWorkletNodeRef.current = null;
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }
    }, []);

    const cleanupSession = useCallback(() => {
        stopAudioProcessing();
        if (sessionPromiseRef.current) {
            // Don't wait for the promise to resolve.
            // If it resolves, close the session. If it fails, that's fine too.
            sessionPromiseRef.current.then(session => {
                session.close();
            }).catch(e => {
                // Ignore errors here, as we are cleaning up anyway
                console.log("Session cleanup caught an error (this is expected if connection failed):", e);
            });
            sessionPromiseRef.current = null;
        }
    }, [stopAudioProcessing]);

    const handleExitClick = useCallback(() => {
        cleanupSession();
        onExit();
    }, [cleanupSession, onExit]);

    const handleMessage = useCallback((message: LiveServerMessage) => {
        if (message.serverContent) {
            if (message.serverContent.inputTranscription) {
                currentTranscriptionRef.current.user += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent.outputTranscription) {
                currentTranscriptionRef.current.model += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent.turnComplete) {
                currentTranscriptionRef.current.isFinal = true;
                setTranscriptions(prev => [...prev, { ...currentTranscriptionRef.current }]);
                currentTranscriptionRef.current = { user: '', model: '', isFinal: false };
            } else {
                 setTranscriptions(prev => {
                    const newTranscriptions = [...prev];
                    const last = newTranscriptions[newTranscriptions.length - 1];
                    if (last && !last.isFinal) {
                        newTranscriptions[newTranscriptions.length - 1] = { ...currentTranscriptionRef.current };
                    } else if (currentTranscriptionRef.current.user || currentTranscriptionRef.current.model) {
                        newTranscriptions.push({ ...currentTranscriptionRef.current });
                    }
                    return newTranscriptions;
                 });
            }
        }
    }, []);

    useEffect(() => {
        const startConversation = async () => {
            setError(null);
            setIsConnecting(true);
            
            try {
                console.log('[LiveScreen] Requesting microphone access...');
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioStreamRef.current = stream;
                console.log('[LiveScreen] Microphone access granted');
                
                const systemInstruction = ZYBER_LIVE_CHAT_PROMPT;
                console.log('[LiveScreen] Connecting to Gemini Live API...');
                sessionPromiseRef.current = geminiService.connectLive(systemInstruction, handleMessage, voiceSettings);

                await sessionPromiseRef.current;
                console.log('[LiveScreen] Live API connected');

                const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                audioContextRef.current = inputAudioContext;
                
                if (inputAudioContext.state === 'suspended') {
                    await inputAudioContext.resume();
                }

                // Load AudioWorklet module (modern replacement for deprecated ScriptProcessorNode)
                try {
                    console.log('[LiveScreen] Loading AudioWorklet processor...');
                    await inputAudioContext.audioWorklet.addModule('/utils/audioWorkletProcessor.js');
                    console.log('[LiveScreen] AudioWorklet loaded successfully');
                } catch (workletError) {
                    console.warn('[LiveScreen] AudioWorklet not supported, falling back to ScriptProcessorNode', workletError);
                    // Fallback to ScriptProcessorNode for older browsers
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    
                    let audioChunkCount = 0;
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        audioChunkCount++;
                        if (audioChunkCount % 100 === 0) {
                            console.log(`[LiveScreen] Sending audio chunk #${audioChunkCount} (ScriptProcessor)`);
                        }
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: geminiService.createAudioBlob(inputData) });
                        });
                    };

                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                    console.log('[LiveScreen] Audio processing started (ScriptProcessor)');
                    setIsConnecting(false);
                    return;
                }

                // Use modern AudioWorklet
                console.log('[LiveScreen] Creating AudioWorklet node...');
                const source = inputAudioContext.createMediaStreamSource(stream);
                const workletNode = new AudioWorkletNode(inputAudioContext, 'audio-capture-processor');
                audioWorkletNodeRef.current = workletNode;

                let audioChunkCount = 0;
                workletNode.port.onmessage = (event) => {
                    const audioData = event.data.audioData;
                    if (audioData) {
                        audioChunkCount++;
                        if (audioChunkCount % 100 === 0) {
                            console.log(`[LiveScreen] Sending audio chunk #${audioChunkCount} (AudioWorklet)`);
                        }
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: geminiService.createAudioBlob(audioData) });
                        });
                    }
                };

                source.connect(workletNode);
                workletNode.connect(inputAudioContext.destination);
                console.log('[LiveScreen] Audio processing started (AudioWorklet)');
                setIsConnecting(false);

            } catch (err: any) {
                console.error("[LiveScreen] Error starting live session:", err);
                let errorMessage = 'FAILED TO INITIALIZE LIVE CONNECTION.';
                
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    errorMessage = 'MICROPHONE ACCESS DENIED. PLEASE GRANT PERMISSIONS.';
                } else if (err.name === 'NotFoundError') {
                    errorMessage = 'NO MICROPHONE DETECTED. CHECK HARDWARE.';
                } else if (err.message) {
                    errorMessage = `ERROR: ${err.message.toUpperCase()}`;
                }
                
                setError(errorMessage);
                setIsConnecting(false);
                stopAudioProcessing();
            }
        };

        startConversation();

        return () => {
            cleanupSession();
        };
    }, [cleanupSession, handleMessage, stopAudioProcessing, voiceSettings]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcriptions]);

    return (
        <TerminalWindow title="VOICE INTERFACE SESSION" onExit={handleExitClick}>
            <div className="flex flex-col text-2xl md:text-3xl" style={{ height: 'calc(100vh - 12rem)' }}>
                <div className="flex-grow overflow-y-auto">
                    {isConnecting && (
                        <div className="flex items-center justify-center h-full">
                            <p className="animate-pulse opacity-70">&gt; Establishing voice link...</p>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center justify-center h-full text-red-500">
                            <p>&gt; ERROR: {error}</p>
                        </div>
                    )}
                    {!isConnecting && !error && (
                        <>
                           {transcriptions.length === 0 && (
                                <p className="opacity-50 animate-pulse">&gt; Voice channel active. Listening...</p>
                           )}
                           {transcriptions.map((t, i) => (
                               <div key={i} className="mb-4">
                                   <div className="flex gap-2 mb-1">
                                       <span className="text-accent opacity-70">&gt;</span>
                                       <span className="text-accent">{t.user || '...'}</span>
                                   </div>
                                   <div className="flex gap-2 mt-2">
                                       <span className="text-primary opacity-70">&gt;&gt;</span>
                                       <span className="whitespace-pre-wrap">{t.model || '...'}</span>
                                   </div>
                               </div>
                           ))}
                           <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </div>
        </TerminalWindow>
    );
};

export default LiveScreen;