import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceSettings } from '../types';
import { DEFAULT_VOICE_SETTINGS } from '../constants';
import TerminalWindow from './TerminalWindow';
import * as geminiService from '../services/geminiService';


interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: VoiceSettings;
    onSettingsChange: (settings: VoiceSettings) => void;
    onLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange, onLogout }) => {
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [isTestingVoice, setIsTestingVoice] = useState(false);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const audioFxNodesRef = useRef<{ oscillator: OscillatorNode } | null>(null);

    useEffect(() => {
        const initAudio = () => {
            if (!audioContext) {
                const context = new (window.AudioContext || (window as any).webkitAudioContext)();
                setAudioContext(context);
            } else if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        };

        const addInitListener = () => {
            document.addEventListener('click', initAudio, { once: true });
            document.addEventListener('keydown', initAudio, { once: true });
        };

        addInitListener();

        return () => {
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
        };
    }, [audioContext]);
    
    const playAudio = useCallback(async (audioBuffer: AudioBuffer) => {
        if (!audioContext) return;
        if (audioContext.state === 'suspended') await audioContext.resume();

        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            if (audioFxNodesRef.current) {
                audioFxNodesRef.current.oscillator.stop();
            }
        }

        let finalNode: AudioNode = audioContext.destination;
        let carrierOscillator: OscillatorNode | null = null;

        if (settings.vocoderEnabled) {
            const modulatorGain = audioContext.createGain();
            modulatorGain.connect(audioContext.destination);

            carrierOscillator = audioContext.createOscillator();
            carrierOscillator.type = 'sawtooth';
            carrierOscillator.frequency.value = settings.vocoderFrequency;

            const carrierGain = audioContext.createGain();
            carrierGain.gain.value = 0.7;

            carrierOscillator.connect(carrierGain);
            carrierGain.connect(modulatorGain.gain);
            carrierOscillator.start();

            finalNode = modulatorGain;
        }

        audioFxNodesRef.current = carrierOscillator ? { oscillator: carrierOscillator } : null;

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(finalNode);
        source.onended = () => {
            audioSourceRef.current = null;
            if (carrierOscillator) carrierOscillator.stop();
            audioFxNodesRef.current = null;
            setIsTestingVoice(false);
        }
        source.start(0);
        audioSourceRef.current = source;
    }, [audioContext, settings.vocoderEnabled, settings.vocoderFrequency]);

    const testCurrentVoice = useCallback(async () => {
        if (!audioContext || isTestingVoice) return;
        setIsTestingVoice(true);
        try {
            let sampleText = '';
            switch (settings.language) {
                case 'no': sampleText = 'Jeg er Zyber.'; break;
                case 'pl': sampleText = 'Jestem Zyber.'; break;
                case 'uk': sampleText = 'Я Зайбер.'; break;
                case 'en': default: sampleText = 'I am Zyber.'; break;
            }
            const audioBuffer = await geminiService.textToSpeech(sampleText, audioContext, settings);
            await playAudio(audioBuffer);
        } catch (error) {
            console.error("Failed to test voice:", error);
            alert("Failed to test voice. Please try again.");
            setIsTestingVoice(false);
        }
    }, [audioContext, isTestingVoice, settings, playAudio]);

    const handleSettingChange = (field: keyof VoiceSettings, value: any) => {
        const newSettings = { ...settings, [field]: value };
        onSettingsChange(newSettings);
    };

    const resetVoiceSettings = useCallback(async () => {
        const newSettings = {
            ...settings, // Keep uiSoundsEnabled
            ...DEFAULT_VOICE_SETTINGS
        };
        onSettingsChange(newSettings);

        if (!audioContext) return;
        setIsTestingVoice(true);
        try {
            const sampleText = 'I am Zyber.'; // English default
            const audioBuffer = await geminiService.textToSpeech(sampleText, audioContext, newSettings);
            await playAudio(audioBuffer);
        } catch (error) {
            console.error("Failed to test voice after reset:", error);
            setIsTestingVoice(false);
        }
    }, [settings, onSettingsChange, audioContext, playAudio]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto" onClick={onClose}>
            <div className="w-full max-w-2xl my-auto" onClick={e => e.stopPropagation()}>
                <TerminalWindow title="VOICE_SYNTH_CONFIG" onExit={onClose} solidBackground>
                    <div className="p-4 md:p-6 text-xl md:text-2xl space-y-4">
                        {/* Language */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="language-select">:: LANGUAGE ::</label>
                            <select
                                id="language-select"
                                value={settings.language}
                                onChange={(e) => handleSettingChange('language', e.target.value as VoiceSettings['language'])}
                                className="bg-background border-2 border-primary p-1 focus:outline-none focus:border-accent"
                            >
                                <option value="en">English (UK)</option>
                                <option value="no">Norwegian</option>
                                <option value="pl">Polish</option>
                                <option value="uk">Ukrainian</option>
                            </select>
                        </div>
                        
                        {/* Gender */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="gender-toggle">:: VOICE GENDER ::</label>
                            <div className="flex items-center gap-2">
                                <span className={settings.gender === 'female' ? 'text-primary' : 'opacity-50'}>FEMALE</span>
                                <button
                                    id="gender-toggle"
                                    onClick={() => handleSettingChange('gender', settings.gender === 'male' ? 'female' : 'male')}
                                    className={`w-14 h-7 rounded-full p-1 transition-colors ${settings.gender === 'male' ? 'bg-primary' : 'bg-gray-600'}`}
                                >
                                    <div className={`w-5 h-5 bg-background rounded-full transition-transform ${settings.gender === 'male' ? 'translate-x-7' : ''}`} />
                                </button>
                                <span className={settings.gender === 'male' ? 'text-primary' : 'opacity-50'}>MALE</span>
                            </div>
                        </div>

                        <button onClick={testCurrentVoice} disabled={isTestingVoice} className="w-full border-2 border-primary p-2 hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isTestingVoice ? ':: GENERATING AUDIO... ::' : ':: TEST CURRENT VOICE ::'}
                        </button>

                        {/* Vocoder */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="vocoder-toggle">:: VOCODER EFFECT ::</label>
                            <div className="flex items-center gap-2">
                                <span>OFF</span>
                                <button
                                    id="vocoder-toggle"
                                    onClick={() => handleSettingChange('vocoderEnabled', !settings.vocoderEnabled)}
                                    className={`w-14 h-7 rounded-full p-1 transition-colors ${settings.vocoderEnabled ? 'bg-primary' : 'bg-gray-600'}`}
                                >
                                    <div className={`w-5 h-5 bg-background rounded-full transition-transform ${settings.vocoderEnabled ? 'translate-x-7' : ''}`} />
                                </button>
                                <span>ON</span>
                            </div>
                        </div>

                        {/* Vocoder Frequency */}
                        <div className={`flex flex-col transition-opacity ${settings.vocoderEnabled ? 'opacity-100' : 'opacity-50'}`}>
                            <label htmlFor="vocoder-freq-slider">:: VOCODER FREQUENCY :: {settings.vocoderFrequency} Hz</label>
                            <input
                                id="vocoder-freq-slider"
                                type="range" min="20" max="200" step="1"
                                value={settings.vocoderFrequency}
                                onChange={(e) => handleSettingChange('vocoderFrequency', parseInt(e.target.value))}
                                disabled={!settings.vocoderEnabled}
                                className="w-full"
                            />
                        </div>
                        <hr className="border-primary/50" />
                        {/* Voice Output */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="voice-output-toggle">:: ZYBER VOICE OUTPUT ::</label>
                            <div className="flex items-center gap-2">
                                <span>OFF</span>
                                <button
                                    id="voice-output-toggle"
                                    onClick={() => handleSettingChange('voiceOutputEnabled', !settings.voiceOutputEnabled)}
                                    className={`w-14 h-7 rounded-full p-1 transition-colors ${settings.voiceOutputEnabled ? 'bg-primary' : 'bg-gray-600'}`}
                                >
                                    <div className={`w-5 h-5 bg-background rounded-full transition-transform ${settings.voiceOutputEnabled ? 'translate-x-7' : ''}`} />
                                </button>
                                <span>ON</span>
                            </div>
                        </div>

                        {/* UI Sounds */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="ui-sounds-toggle">:: UI SOUNDS ::</label>
                            <div className="flex items-center gap-2">
                                <span>OFF</span>
                                <button
                                    id="ui-sounds-toggle"
                                    onClick={() => handleSettingChange('uiSoundsEnabled', !settings.uiSoundsEnabled)}
                                    className={`w-14 h-7 rounded-full p-1 transition-colors ${settings.uiSoundsEnabled ? 'bg-primary' : 'bg-gray-600'}`}
                                >
                                    <div className={`w-5 h-5 bg-background rounded-full transition-transform ${settings.uiSoundsEnabled ? 'translate-x-7' : ''}`} />
                                </button>
                                <span>ON</span>
                            </div>
                        </div>

                        <button onClick={resetVoiceSettings} className="w-full border-2 border-primary p-2 hover:bg-primary/10 transition-colors">
                            :: RESET VOICE SETTINGS ::
                        </button>
                        
                        <button onClick={onLogout} className="w-full border-2 border-red-500 text-red-500 p-2 hover:bg-red-500/10 transition-colors mt-4">
                            :: EXIT TERMINAL ::
                        </button>
                    </div>
                </TerminalWindow>
            </div>
        </div>
    );
};

export default SettingsModal;