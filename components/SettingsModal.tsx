import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceSettings } from '../types';
import { DEFAULT_VOICE_SETTINGS } from '../constants';
import TerminalWindow from './TerminalWindow';
import * as geminiService from '../services/geminiService';
import { createVoiceEffectChain, VOICE_PRESETS, VoiceEffectChain, applyPitchShift } from '../utils/voiceEffects';
import { speakAIResponse, isSpeechSynthesisSupported } from '../utils/lowTechVoice';


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
    const effectChainRef = useRef<VoiceEffectChain | null>(null);

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

        // Clean up any existing audio
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            if (audioFxNodesRef.current) {
                audioFxNodesRef.current.oscillator.stop();
            }
        }
        if (effectChainRef.current) {
            effectChainRef.current.cleanup();
            effectChainRef.current = null;
        }

        let finalNode: AudioNode = audioContext.destination;
        let carrierOscillator: OscillatorNode | null = null;

        // Use advanced voice effects if enabled
        if (settings.useAdvancedEffects) {
            const presetSettings = settings.voicePreset === 'custom' && settings.customEffects
                ? settings.customEffects
                : VOICE_PRESETS[settings.voicePreset];
            
            const effectChain = createVoiceEffectChain(audioContext, presetSettings);
            effectChainRef.current = effectChain;
            finalNode = effectChain.input;
            effectChain.output.connect(audioContext.destination);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            applyPitchShift(source, presetSettings.pitchShift);
            source.connect(finalNode);
            source.onended = () => {
                audioSourceRef.current = null;
                if (effectChain) {
                    effectChain.cleanup();
                }
                effectChainRef.current = null;
                setIsTestingVoice(false);
            };
            source.start(0);
            audioSourceRef.current = source;
            
        } else if (settings.vocoderEnabled) {
            // Fall back to simple vocoder
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
            audioFxNodesRef.current = { oscillator: carrierOscillator };

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(finalNode);
            source.onended = () => {
                audioSourceRef.current = null;
                if (carrierOscillator) carrierOscillator.stop();
                audioFxNodesRef.current = null;
                setIsTestingVoice(false);
            };
            source.start(0);
            audioSourceRef.current = source;
            
        } else {
            // No effects
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(finalNode);
            source.onended = () => {
                audioSourceRef.current = null;
                setIsTestingVoice(false);
            };
            source.start(0);
            audioSourceRef.current = source;
        }
    }, [audioContext, settings]);

    const testCurrentVoice = useCallback(async () => {
        if (isTestingVoice) return;
        
        // Check if SpeechSynthesis is supported
        if (!isSpeechSynthesisSupported()) {
            alert("Speech synthesis not supported in this browser.");
            return;
        }
        
        setIsTestingVoice(true);
        console.log('[SettingsModal] Testing voice with settings:', settings);
        
        try {
            // Sample text with emotion markers based on language
            let sampleText = '';
            switch (settings.language) {
                case 'no':
                    sampleText = '[THREATENING] Jeg er Zyber. [SINISTER] Velkommen til min verden. [ANGRY] Våg å utfordre meg!';
                    break;
                case 'pl':
                    sampleText = '[THREATENING] Jestem Zyber. [SINISTER] Witaj w moim świecie. [ANGRY] Spróbuj mnie pokonać!';
                    break;
                case 'uk':
                    sampleText = '[THREATENING] Я Зайбер. [SINISTER] Ласкаво просимо до мого світу. [ANGRY] Спробуй кинути мені виклик!';
                    break;
                case 'en':
                default:
                    sampleText = '[THREATENING] I am Zyber. [SINISTER] Welcome to my domain. [ANGRY] Dare to challenge me!';
                    break;
            }
            
            console.log('[SettingsModal] Testing low-tech voice with emotions:', sampleText);
            
            // Use the new emotional low-tech voice system
            await speakAIResponse(sampleText, settings.language);
            
            console.log('[SettingsModal] Voice test completed successfully');
            setIsTestingVoice(false);
        } catch (error: any) {
            console.error("[SettingsModal] Failed to test voice:", error);
            alert(`Failed to test voice: ${error.message || 'Unknown error'}`);
            setIsTestingVoice(false);
        }
    }, [isTestingVoice, settings]);

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
            <div className="w-full max-w-3xl my-auto" onClick={e => e.stopPropagation()}>
                <TerminalWindow title="SYSTEM_CONFIG" onExit={onClose} solidBackground>
                    <div className="p-4 md:p-6 text-2xl md:text-3xl space-y-6">
                        {/* Section: Voice Configuration */}
                        <div className="border-b border-primary/30 pb-2 mb-4">
                            <div className="text-accent opacity-70">VOICE_CONFIGURATION</div>
                        </div>

                        {/* Language */}
                        <div className="flex items-center justify-between gap-4">
                            <label htmlFor="language-select" className="flex-shrink-0">LANGUAGE:</label>
                            <select
                                id="language-select"
                                value={settings.language}
                                onChange={(e) => handleSettingChange('language', e.target.value as VoiceSettings['language'])}
                                className="bg-background border-2 border-primary p-2 focus:outline-none focus:border-accent text-2xl md:text-3xl"
                            >
                                <option value="en">English (UK)</option>
                                <option value="no">Norwegian</option>
                                <option value="pl">Polish</option>
                                <option value="uk">Ukrainian</option>
                            </select>
                        </div>
                        
                        {/* Gender */}
                        <div className="flex items-center justify-between gap-4">
                            <label htmlFor="gender-toggle" className="flex-shrink-0">GENDER:</label>
                            <div className="flex items-center gap-3">
                                <span className={settings.gender === 'female' ? 'text-accent' : 'opacity-50'}>FEMALE</span>
                                <button
                                    id="gender-toggle"
                                    onClick={() => handleSettingChange('gender', settings.gender === 'male' ? 'female' : 'male')}
                                    className={`w-16 h-8 rounded-full p-1 transition-colors ${settings.gender === 'male' ? 'bg-primary' : 'bg-gray-600'}`}
                                    aria-label={`Switch to ${settings.gender === 'male' ? 'female' : 'male'} voice`}
                                >
                                    <div className={`w-6 h-6 bg-background rounded-full transition-transform ${settings.gender === 'male' ? 'translate-x-8' : ''}`} />
                                </button>
                                <span className={settings.gender === 'male' ? 'text-accent' : 'opacity-50'}>MALE</span>
                            </div>
                        </div>

                        <button 
                            onClick={testCurrentVoice} 
                            disabled={isTestingVoice} 
                            className="w-full border-2 border-primary p-3 hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isTestingVoice ? '[GENERATING...]' : '[TEST_VOICE]'}
                        </button>

                        {/* Section: Voice Effects */}
                        <div className="border-b border-primary/30 pb-2 mb-4 mt-6">
                            <div className="text-accent opacity-70">VOICE_EFFECTS</div>
                        </div>
                        
                        {/* Synthetic Voice Mode Toggle */}
                        <div className="flex items-center justify-between gap-4">
                            <label htmlFor="advanced-effects-toggle" className="flex-shrink-0">SYNTHETIC_MODE:</label>
                            <div className="flex items-center gap-3">
                                <span className={!settings.useAdvancedEffects ? 'text-accent' : 'opacity-50'}>OFF</span>
                                <button
                                    id="advanced-effects-toggle"
                                    onClick={() => handleSettingChange('useAdvancedEffects', !settings.useAdvancedEffects)}
                                    className={`w-16 h-8 rounded-full p-1 transition-colors ${settings.useAdvancedEffects ? 'bg-accent' : 'bg-gray-600'}`}
                                    aria-label={`${settings.useAdvancedEffects ? 'Disable' : 'Enable'} synthetic voice mode`}
                                >
                                    <div className={`w-6 h-6 bg-background rounded-full transition-transform ${settings.useAdvancedEffects ? 'translate-x-8' : ''}`} />
                                </button>
                                <span className={settings.useAdvancedEffects ? 'text-accent' : 'opacity-50'}>ON</span>
                            </div>
                        </div>

                        {/* Voice Preset Selector */}
                        {settings.useAdvancedEffects && (
                            <div className="flex flex-col gap-3">
                                <label htmlFor="preset-select">PRESET:</label>
                                <select
                                    id="preset-select"
                                    value={settings.voicePreset}
                                    onChange={(e) => handleSettingChange('voicePreset', e.target.value as VoiceSettings['voicePreset'])}
                                    className="bg-background border-2 border-accent p-2 focus:outline-none focus:border-primary text-2xl md:text-3xl"
                                >
                                    <option value="zyber">ZYBER (Default)</option>
                                    <option value="hal">HAL 9000 (Calm)</option>
                                    <option value="glados">GLaDOS (Synthetic)</option>
                                    <option value="hawking">HAWKING (Clear)</option>
                                    <option value="menacing">MENACING (Dark)</option>
                                    <option value="glitchy">GLITCHY (Unstable)</option>
                                    <option value="minimal">MINIMAL (Original)</option>
                                </select>
                                <div className="text-lg opacity-60 px-1">
                                    {settings.voicePreset === 'zyber' && '> Balanced menacing robotic AI'}
                                    {settings.voicePreset === 'hal' && '> Calm, clear, subtly threatening'}
                                    {settings.voicePreset === 'glados' && '> Synthetic, slightly unhinged'}
                                    {settings.voicePreset === 'hawking' && '> Clear robotic speech'}
                                    {settings.voicePreset === 'menacing' && '> Deep, dark, threatening'}
                                    {settings.voicePreset === 'glitchy' && '> Corrupted digital distortion'}
                                    {settings.voicePreset === 'minimal' && '> No effects applied'}
                                </div>
                            </div>
                        )}

                        {/* Section: System Settings */}
                        <div className="border-b border-primary/30 pb-2 mb-4 mt-6">
                            <div className="text-accent opacity-70">SYSTEM_SETTINGS</div>
                        </div>

                        {/* UI Sounds */}
                        <div className="flex items-center justify-between gap-4">
                            <label htmlFor="ui-sounds-toggle" className="flex-shrink-0">UI_SOUNDS:</label>
                            <div className="flex items-center gap-3">
                                <span className={!settings.uiSoundsEnabled ? 'text-accent' : 'opacity-50'}>OFF</span>
                                <button
                                    id="ui-sounds-toggle"
                                    onClick={() => handleSettingChange('uiSoundsEnabled', !settings.uiSoundsEnabled)}
                                    className={`w-16 h-8 rounded-full p-1 transition-colors ${settings.uiSoundsEnabled ? 'bg-primary' : 'bg-gray-600'}`}
                                    aria-label={`${settings.uiSoundsEnabled ? 'Disable' : 'Enable'} UI sounds`}
                                >
                                    <div className={`w-6 h-6 bg-background rounded-full transition-transform ${settings.uiSoundsEnabled ? 'translate-x-8' : ''}`} />
                                </button>
                                <span className={settings.uiSoundsEnabled ? 'text-accent' : 'opacity-50'}>ON</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 space-y-3">
                            <button 
                                onClick={resetVoiceSettings} 
                                className="w-full border-2 border-primary p-3 hover:bg-primary/10 transition-colors"
                            >
                                [RESET_TO_DEFAULTS]
                            </button>
                            
                            <button 
                                onClick={onLogout} 
                                className="w-full border-2 border-red-500 text-red-500 p-3 hover:bg-red-500/10 transition-colors"
                            >
                                [LOGOUT]
                            </button>
                        </div>
                    </div>
                </TerminalWindow>
            </div>
        </div>
    );
};

export default SettingsModal;