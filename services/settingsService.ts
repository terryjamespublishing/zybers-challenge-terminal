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
            // Merge with defaults to ensure all properties exist
            return {
                ...DEFAULT_VOICE_SETTINGS,
                uiSoundsEnabled: true,
                voiceOutputEnabled: true,
                ...parsed,
            };
        }
    } catch (error) {
        console.error('Failed to load voice settings:', error);
    }

    // Return defaults if nothing stored or error occurred
    return {
        ...DEFAULT_VOICE_SETTINGS,
        uiSoundsEnabled: true,
        voiceOutputEnabled: true,
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
        voiceOutputEnabled: true,
    };
    saveVoiceSettings(defaults);
    return defaults;
};

