import { VoiceSettings } from '../types';
import { DEFAULT_VOICE_SETTINGS } from '../constants';

const SETTINGS_KEY = 'zyber_voice_settings';

/**
 * Load voice settings from localStorage
 */
export const loadVoiceSettings = (): VoiceSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Smart merge: use saved values only if they exist, otherwise use defaults
            // This ensures new properties get their default values even with old saved settings
            return {
                ...DEFAULT_VOICE_SETTINGS,
                uiSoundsEnabled: true,
                // Only override with saved values that actually exist
                ...(parsed.gender !== undefined && { gender: parsed.gender }),
                ...(parsed.language !== undefined && { language: parsed.language }),
                ...(parsed.vocoderEnabled !== undefined && { vocoderEnabled: parsed.vocoderEnabled }),
                ...(parsed.vocoderFrequency !== undefined && { vocoderFrequency: parsed.vocoderFrequency }),
                ...(parsed.uiSoundsEnabled !== undefined && { uiSoundsEnabled: parsed.uiSoundsEnabled }),
                ...(parsed.useAdvancedEffects !== undefined && { useAdvancedEffects: parsed.useAdvancedEffects }),
                ...(parsed.voicePreset !== undefined && { voicePreset: parsed.voicePreset }),
                ...(parsed.customEffects !== undefined && { customEffects: parsed.customEffects }),
            };
        }
    } catch (error) {
        console.error('Failed to load voice settings:', error);
    }
    
    // Return defaults if nothing stored or error occurred
    return {
        ...DEFAULT_VOICE_SETTINGS,
        uiSoundsEnabled: true,
    };
};

/**
 * Save voice settings to localStorage
 */
export const saveVoiceSettings = (settings: VoiceSettings): void => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Failed to save voice settings:', error);
    }
};

/**
 * Reset voice settings to defaults
 */
export const resetVoiceSettings = (): VoiceSettings => {
    const defaults = {
        ...DEFAULT_VOICE_SETTINGS,
        uiSoundsEnabled: true,
    };
    saveVoiceSettings(defaults);
    return defaults;
};

