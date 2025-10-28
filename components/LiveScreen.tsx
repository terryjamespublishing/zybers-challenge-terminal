import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as geminiService from '../services/geminiService';
import { VoiceSettings } from '../types';
import { LiveServerMessage, LiveSession } from '@google/genai';
import { ZYBER_LIVE_CHAT_PROMPT } from '../constants';
import TerminalWindow from './TerminalWindow';

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
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioStreamRef.current = stream;
                
                const systemInstruction = ZYBER_LIVE_CHAT_PROMPT;
                sessionPromiseRef.current = geminiService.connectLive(systemInstruction, handleMessage, voiceSettings);

                await sessionPromiseRef.current;

                const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                audioContextRef.current = inputAudioContext;
                
                if (inputAudioContext.state === 'suspended') {
                    await inputAudioContext.resume();
                }

                // Load AudioWorklet module (modern replacement for deprecated ScriptProcessorNode)
                try {
                    await inputAudioContext.audioWorklet.addModule('/utils/audioWorkletProcessor.js');
                } catch (workletError) {
                    console.warn('AudioWorklet not supported, falling back to ScriptProcessorNode');
                    // Fallback to ScriptProcessorNode for older browsers
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: geminiService.createAudioBlob(inputData) });
                        });
                    };

                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                    setIsConnecting(false);
                    return;
                }

                // Use modern AudioWorklet
                const source = inputAudioContext.createMediaStreamSource(stream);
                const workletNode = new AudioWorkletNode(inputAudioContext, 'audio-capture-processor');
                audioWorkletNodeRef.current = workletNode;

                workletNode.port.onmessage = (event) => {
                    const audioData = event.data.audioData;
                    if (audioData) {
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: geminiService.createAudioBlob(audioData) });
                        });
                    }
                };

                source.connect(workletNode);
                workletNode.connect(inputAudioContext.destination);
                setIsConnecting(false);

            } catch (err) {
                console.error("Error starting live session:", err);
                setError('FAILED TO INITIALIZE LIVE CONNECTION. ACCESS DENIED.');
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
        <TerminalWindow title="" onExit={handleExitClick}>
            <div className="flex flex-col p-2 sm:p-4 text-xl md:text-2xl" style={{ height: 'calc(100vh - 11rem)' }}>
                <div className="flex-grow overflow-y-auto pr-2">
                    {isConnecting && (
                        <div className="flex-grow flex items-center justify-center h-full">
                            <p className="animate-pulse">INITIALIZING LIVE CONNECTION...</p>
                        </div>
                    )}
                    {error && (
                        <div className="flex-grow flex items-center justify-center h-full text-red-500">
                            <p>{error}</p>
                        </div>
                    )}
                    {!isConnecting && !error && (
                        <>
                           {transcriptions.length === 0 && (
                                <p className="text-center opacity-70 animate-pulse">AWAITING AUDIO STREAM... LISTENING...</p>
                           )}
                           {transcriptions.map((t, i) => (
                               <div key={i} className="mb-4">
                                   <p className="font-bold text-accent">USER:</p>
                                   <p className="pl-4 whitespace-pre-wrap">{t.user || '...'}</p>
                                   <p className="font-bold text-primary mt-2">ZYBER:</p>
                                   <p className="pl-4 whitespace-pre-wrap">{t.model || '...'}</p>
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