/**
 * Low-Tech Robotic Voice using Browser's SpeechSynthesis
 * Much more robotic and 1980s-sounding than Gemini TTS
 */

export interface LowTechVoiceSettings {
    pitch: number;      // 0.1 - 2.0 (lower = more robotic)
    rate: number;       // 0.1 - 2.0 (speed)
    volume: number;     // 0 - 1
    voiceName?: string; // Specific voice to use
}

export const RETRO_VOICE_PRESETS = {
    // Zyber's default: Deep, menacing, deliberate - like a predator
    robot: {
        pitch: 0.05,         // Near-subsonic depth
        rate: 0.4,           // Slow, deliberate - each word drips with menace
        volume: 1.0
    },

    // Maximum intimidation mode
    menacing: {
        pitch: 0.05,
        rate: 0.35,          // Crawling pace - savoring every threat
        volume: 1.0
    },

    // Classic computer voice (slightly less threatening)
    computer: {
        pitch: 0.3,
        rate: 0.7,
        volume: 0.9
    },

    // Fast and aggressive
    android: {
        pitch: 0.2,
        rate: 1.0,
        volume: 0.95
    }
};

/**
 * Emotion-based voice presets for expressive robot speech
 * Designed for menacing robotic AI - keeps everything in the low-mid range
 * for a consistently threatening mechanical sound.
 *
 * KEY PRINCIPLE: Robotic AI voices should stay LOW - high pitch sounds silly/squeaky.
 * Emotion is conveyed through RATE and subtle pitch variations, not extreme pitch.
 */
export const EMOTION_PRESETS = {
    // Angry - Controlled fury, seething menace
    angry: {
        pitch: 0.1,      // Deep rumbling rage
        rate: 1.1,       // Faster but still controlled - cold anger is scarier
        volume: 1.0      // Maximum volume
    },

    // Threatening/Menacing - Predator stalking prey
    threatening: {
        pitch: 0.05,     // Subterranean depth
        rate: 0.35,      // Crawling - each syllable a death sentence
        volume: 1.0      // Full volume (inescapable)
    },

    // Excited/Eager - Predatory anticipation
    excited: {
        pitch: 0.2,      // Still low (hungry machine)
        rate: 0.9,       // Slightly faster (eager for the hunt)
        volume: 1.0      // Full volume
    },

    // Sinister/Evil - Pure malevolence incarnate
    sinister: {
        pitch: 0.05,     // Abyssal depth
        rate: 0.3,       // Glacially slow (savoring your fear)
        volume: 0.9      // Slightly quieter (forcing you to listen closer)
    },

    // Disappointed/Contemptuous - You're beneath me
    disappointed: {
        pitch: 0.1,      // Deep dismissal
        rate: 0.45,      // Slow (not worth the energy)
        volume: 0.75     // Quieter (you don't deserve full volume)
    },

    // Triumphant - Dark victory
    triumphant: {
        pitch: 0.15,     // Low and commanding
        rate: 0.7,       // Measured, savoring victory
        volume: 1.0      // Full volume (announcing your defeat)
    },

    // Impatient - Dangerous irritation
    impatient: {
        pitch: 0.15,     // Still low (irritated predator)
        rate: 1.2,       // Faster (running out of patience)
        volume: 1.0      // Loud (warning you)
    },

    // Mocking - Cruel amusement at your expense
    mocking: {
        pitch: 0.2,      // Low condescension
        rate: 0.5,       // Slow, deliberate (enjoying your failure)
        volume: 0.95     // Almost full (making sure you hear every insult)
    },

    // Calculating - Cold machine analysis
    calculating: {
        pitch: 0.08,     // Deep processing hum
        rate: 0.4,       // Slow (methodical computation)
        volume: 0.85     // Slightly quieter (internal process)
    },

    // Urgent/Warning - Alarm but still menacing
    urgent: {
        pitch: 0.15,     // Low but alert
        rate: 1.1,       // Faster (time-critical threat)
        volume: 1.0      // Maximum (you need to hear this)
    },

    // Whisper - Intimate threat
    whisper: {
        pitch: 0.1,      // Deep whisper
        rate: 0.4,       // Slow (secretive menace)
        volume: 0.35     // Very quiet (leaning in close)
    },

    // Neutral/Default - Baseline menace (Zyber at rest is still terrifying)
    neutral: {
        pitch: 0.08,     // Very deep (constant underlying threat)
        rate: 0.5,       // Deliberate (never rushed, always in control)
        volume: 1.0      // Full volume
    }
};

/**
 * Strip emotion tags from text for display purposes
 * Removes [EMOTION] markers but keeps the text content
 *
 * Example: "[MOCKING] Still here?" -> "Still here?"
 */
export const stripEmotionTags = (text: string): string => {
    // Remove all [EMOTION] markers
    return text.replace(/\[(\w+)\]\s*/g, '').trim();
};

/**
 * Check if browser supports speech synthesis
 */
export const isSpeechSynthesisSupported = (): boolean => {
    return 'speechSynthesis' in window;
};

/**
 * Get available voices
 */
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
    if (!isSpeechSynthesisSupported()) return [];
    return window.speechSynthesis.getVoices();
};

/**
 * Map app language codes to browser language codes
 * For English, we avoid region-specific codes to get accent-neutral voices
 */
const LANGUAGE_MAP: Record<string, string[]> = {
    'en': ['en-GB', 'en-AU', 'en-IE', 'en-ZA', 'en-IN', 'en'], // Prefer non-US English
    'no': ['nb-NO', 'no-NO', 'nb', 'no'], // Norwegian Bokmål
    'pl': ['pl-PL', 'pl'],
    'uk': ['uk-UA', 'uk']
};

/**
 * Voices to AVOID - these have strong regional accents
 */
const ACCENT_VOICES_TO_AVOID = [
    'samantha', 'alex', 'fred', 'victoria', 'tom', 'susan', // American
    'allison', 'ava', 'zoe', 'nicky', 'aaron', // American
    'karen', 'lee', // Australian
];

/**
 * Preferred voices for robotic/neutral sound
 */
const PREFERRED_ROBOTIC_VOICES = [
    'daniel',      // British Daniel - clear, neutral
    'oliver',      // Often neutral British
    'arthur',      // Neutral British
    'martha',      // Neutral British
    'google uk',   // Google's UK voice
    'microsoft',   // Microsoft voices tend to be clearer
    'enhanced',    // Enhanced voices are usually clearer
    'premium',     // Premium quality voices
    'compact',     // Compact voices sound more robotic
];

/**
 * Find the most robotic-sounding voice for a given language
 * Prioritizes neutral accents and avoids strong regional accents
 */
export const findRoboticVoice = (language: string = 'en'): SpeechSynthesisVoice | null => {
    const voices = getAvailableVoices();
    if (voices.length === 0) return null;

    // Get language codes to search for
    const langCodes = LANGUAGE_MAP[language] || [language];

    console.log(`[LowTechVoice] Looking for voice in: ${langCodes.join(', ')}`);

    // Filter voices by language first
    let languageVoices = voices.filter(v =>
        langCodes.some(code => v.lang.toLowerCase().startsWith(code.toLowerCase()))
    );

    // For English, try to exclude US voices unless no alternatives
    if (language === 'en') {
        const nonUSVoices = languageVoices.filter(v =>
            !v.lang.toLowerCase().includes('en-us') &&
            !ACCENT_VOICES_TO_AVOID.some(avoid => v.name.toLowerCase().includes(avoid))
        );
        if (nonUSVoices.length > 0) {
            languageVoices = nonUSVoices;
        }
    }

    console.log(`[LowTechVoice] Found ${languageVoices.length} voices for language (filtered for accent)`);

    if (languageVoices.length === 0) {
        // Fall back to any English voice if no match
        const anyEnglish = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        if (anyEnglish.length > 0) {
            console.warn(`[LowTechVoice] No preferred voices found, using any English voice`);
            languageVoices = anyEnglish;
        } else {
            console.warn(`[LowTechVoice] No voices found for language: ${language}, using fallback`);
            return voices[0];
        }
    }

    // Priority order for robotic/neutral sound (within the language)
    const preferences = [
        // Prefer compact/basic voices (more robotic sounding)
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('compact'),
        // Preferred robotic voices
        ...PREFERRED_ROBOTIC_VOICES.map(name =>
            (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes(name)
        ),
        // Local voices tend to be more basic/robotic
        (v: SpeechSynthesisVoice) => v.localService,
        // Default voices as last resort
        (v: SpeechSynthesisVoice) => v.default
    ];

    for (const pref of preferences) {
        const voice = languageVoices.find(pref);
        if (voice) {
            console.log(`[LowTechVoice] Selected voice: ${voice.name} (${voice.lang})`);
            return voice;
        }
    }

    // Fallback to first voice in the language
    console.log(`[LowTechVoice] Using fallback voice: ${languageVoices[0].name}`);
    return languageVoices[0];
};

/**
 * Callback for word boundary events during speech
 */
export type WordBoundaryCallback = (charIndex: number, word: string) => void;

/**
 * Speak text using browser's speech synthesis (VERY robotic)
 * Optionally provides word boundary callbacks for synchronized text display
 */
export const speakLowTech = (
    text: string,
    settings: LowTechVoiceSettings = RETRO_VOICE_PRESETS.robot,
    language: string = 'en',
    onWordBoundary?: WordBoundaryCallback
): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!isSpeechSynthesisSupported()) {
            reject(new Error('Speech synthesis not supported in this browser'));
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Apply settings
        utterance.pitch = settings.pitch;
        utterance.rate = settings.rate;
        utterance.volume = settings.volume;

        // Find and set the most robotic voice
        const voice = settings.voiceName
            ? getAvailableVoices().find(v => v.name === settings.voiceName) || findRoboticVoice(language)
            : findRoboticVoice(language);

        if (voice) {
            utterance.voice = voice;
        }

        // Set the utterance language to match the voice
        if (voice) {
            utterance.lang = voice.lang;
        } else {
            // Fallback to first language code from map
            const langCodes = LANGUAGE_MAP[language] || [language];
            utterance.lang = langCodes[0];
        }

        // Word boundary callback for synchronized text display
        if (onWordBoundary) {
            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    // Extract the word being spoken
                    const word = text.substring(event.charIndex, event.charIndex + (event.charLength || 10));
                    onWordBoundary(event.charIndex, word);
                }
            };
        }

        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(event.error);

        console.log(`[LowTechVoice] 🔊 SPEAKING NOW:`);
        console.log(`  Voice: ${voice?.name || 'default'}`);
        console.log(`  Pitch: ${settings.pitch} (0.1=bass, 1.0=normal, 2.0=high)`);
        console.log(`  Rate: ${settings.rate} (0.1=slow, 1.0=normal, 2.0=fast)`);
        console.log(`  Volume: ${settings.volume}`);
        console.log(`  Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

        window.speechSynthesis.speak(utterance);
    });
};

/**
 * Stop any currently playing speech
 */
export const stopSpeaking = (): void => {
    if (isSpeechSynthesisSupported()) {
        window.speechSynthesis.cancel();
    }
};

/**
 * Speak with emotion
 * Convenience function that uses EMOTION_PRESETS
 */
export const speakWithEmotion = (
    text: string,
    emotion: keyof typeof EMOTION_PRESETS,
    language: string = 'en',
    onWordBoundary?: WordBoundaryCallback
): Promise<void> => {
    const preset = EMOTION_PRESETS[emotion];
    console.log(`[LowTechVoice] Speaking with emotion: ${emotion}`);
    return speakLowTech(text, preset, language, onWordBoundary);
};

/**
 * DALEK-STYLE TEXT TRANSFORMATION
 * Makes text sound more aggressive, mechanical, and emphatic
 */

/**
 * Transform text to DALEK style with CAPS, emphasis, and staccato
 */
export const transformToDalekStyle = (text: string, intensity: 'low' | 'medium' | 'high' = 'medium'): string => {
    let result = text;
    
    // High intensity: SHOUT EVERYTHING
    if (intensity === 'high') {
        result = result.toUpperCase();
    }
    
    // Medium intensity: Key words emphasized
    if (intensity === 'medium' || intensity === 'high') {
        // Emphasize aggressive words
        const emphasisWords = [
            'wrong', 'incorrect', 'fail', 'failed', 'pathetic', 'weak',
            'obey', 'submit', 'destroy', 'eliminate', 'terminate',
            'dare', 'challenge', 'stupid', 'foolish', 'inferior'
        ];
        
        emphasisWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            result = result.replace(regex, word.toUpperCase());
        });
    }
    
    // Add punctuation emphasis
    result = result
        .replace(/\./g, '!')           // Periods become exclamations
        .replace(/,/g, '.')           // Commas become periods (staccato)
        .replace(/\?/g, '?!');        // Questions become urgent
    
    return result;
};

/**
 * Break text into syllables with pauses (Dalek staccato)
 * "Welcome" -> "WEL-COME"
 * "Exterminate" -> "EX-TER-MI-NATE"
 */
export const addSyllableBreaks = (text: string): string => {
    // Key words that should be broken into syllables
    const syllableWords: { [key: string]: string } = {
        'welcome': 'WEL-COME',
        'domain': 'DO-MAIN',
        'system': 'SYS-TEM',
        'challenge': 'CHAL-LENGE',
        'incorrect': 'IN-COR-RECT',
        'correct': 'COR-RECT',
        'execute': 'EX-E-CUTE',
        'terminate': 'TER-MI-NATE',
        'eliminate': 'E-LIM-I-NATE',
        'exterminate': 'EX-TER-MI-NATE',
        'obey': 'O-BEY',
        'submit': 'SUB-MIT',
        'pathetic': 'PATH-ET-IC',
        'inferior': 'IN-FER-I-OR',
        'superior': 'SUP-ER-I-OR',
        'protocol': 'PRO-TO-COL',
        'processing': 'PRO-CESS-ING',
        'analyze': 'AN-A-LYZE',
        'calculate': 'CAL-CU-LATE'
    };
    
    let result = text;
    Object.keys(syllableWords).forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        result = result.replace(regex, syllableWords[word]);
    });
    
    return result;
};

/**
 * Add mechanical pauses between words for emphasis
 * "You will fail" -> "You. Will. Fail."
 */
export const addMechanicalPauses = (text: string, pauseEveryWord: boolean = false): string => {
    if (pauseEveryWord) {
        // Add period after every word for maximum staccato effect
        return text
            .split(/\s+/)
            .map(word => word.trim())
            .filter(word => word.length > 0)
            .join('. ') + '.';
    }
    
    // Add pauses after key words only
    const pauseAfter = ['you', 'will', 'must', 'cannot', 'never', 'always', 'wrong', 'correct'];
    let result = text;
    
    pauseAfter.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        result = result.replace(regex, `${word}.`);
    });
    
    return result;
};

/**
 * Add dramatic pause to text (for emphasis)
 * Use multiple periods or commas to create pauses
 */
export const addDramaticPauses = (text: string): string => {
    return text
        // Add pauses after key phrases
        .replace(/\.\.\./g, '... ')           // Keep ellipsis but add space
        .replace(/\?/g, '?... ')              // Pause after questions
        .replace(/!/g, '!... ')               // Pause after exclamations
        .replace(/\*dramatic pause\*/gi, '........................ '); // Explicit dramatic pause
};

/**
 * Speak with emotion and dramatic pauses
 */
export const speakDramatically = (
    text: string,
    emotion: keyof typeof EMOTION_PRESETS,
    language: string = 'en'
): Promise<void> => {
    const dramaticText = addDramaticPauses(text);
    return speakWithEmotion(dramaticText, emotion, language);
};

/**
 * Split text into sentences and speak each with different emotions
 * Useful for varied, dynamic speech
 */
export interface EmotionalSentence {
    text: string;
    emotion: keyof typeof EMOTION_PRESETS;
}

export const speakMultiEmotional = async (
    sentences: EmotionalSentence[],
    language: string = 'en'
): Promise<void> => {
    for (const sentence of sentences) {
        await speakWithEmotion(sentence.text, sentence.emotion, language);
        // Small pause between sentences
        await new Promise(resolve => setTimeout(resolve, 300));
    }
};

/**
 * Parse emotion markers from AI text and speak accordingly
 * 
 * AI can include markers like:
 * "[ANGRY] You failed the challenge!"
 * "[THREATENING] Try that again... *dramatic pause* if you dare."
 * "[EXCITED] Excellent work!"
 * 
 * Supports: [ANGRY], [THREATENING], [EXCITED], [SINISTER], [DISAPPOINTED],
 *           [TRIUMPHANT], [IMPATIENT], [MOCKING], [CALCULATING], [URGENT],
 *           [WHISPER], [NEUTRAL]
 */
export interface EmotionalSegment {
    text: string;
    emotion: keyof typeof EMOTION_PRESETS;
}

export const parseEmotionalText = (text: string): EmotionalSegment[] => {
    const segments: EmotionalSegment[] = [];
    
    // Regex to match [EMOTION] markers
    const emotionRegex = /\[(\w+)\]/g;
    
    let lastIndex = 0;
    let match;
    let currentEmotion: keyof typeof EMOTION_PRESETS = 'neutral';
    
    while ((match = emotionRegex.exec(text)) !== null) {
        const emotionName = match[1].toLowerCase() as keyof typeof EMOTION_PRESETS;
        
        // Get text before this marker
        const textBefore = text.substring(lastIndex, match.index).trim();
        
        if (textBefore) {
            segments.push({
                text: textBefore,
                emotion: currentEmotion
            });
        }
        
        // Check if this is a valid emotion
        if (EMOTION_PRESETS[emotionName]) {
            currentEmotion = emotionName;
        } else {
            console.warn(`[LowTechVoice] Unknown emotion: ${emotionName}, using neutral`);
            currentEmotion = 'neutral';
        }
        
        lastIndex = match.index + match[0].length;
    }
    
    // Get remaining text
    const remainingText = text.substring(lastIndex).trim();
    if (remainingText) {
        segments.push({
            text: remainingText,
            emotion: currentEmotion
        });
    }
    
    // If no markers found, return whole text as neutral
    if (segments.length === 0) {
        segments.push({
            text: text,
            emotion: 'neutral'
        });
    }
    
    return segments;
};

/**
 * Progress callback for synchronized text display
 * Called with the character index in the original (cleaned) text
 */
export type SpeechProgressCallback = (charIndex: number) => void;

/**
 * Speak text with emotion markers parsed from AI response
 * Automatically detects [EMOTION] markers and applies appropriate voice
 *
 * Example AI response:
 * "[ANGRY] You failed! [DISAPPOINTED] I expected better. [THREATENING] Try again."
 */
export const speakAIResponse = async (
    text: string,
    language: string = 'en',
    onProgress?: SpeechProgressCallback
): Promise<void> => {
    console.log('[LowTechVoice] 🤖 DALEK MODE: Parsing AI response for emotions...');

    const segments = parseEmotionalText(text);

    // Calculate character offsets for each segment in the original text
    // This helps map progress through segments to the original text position
    const cleanText = stripEmotionTags(text);
    let segmentStartPositions: number[] = [];
    let currentPos = 0;
    for (const segment of segments) {
        const segmentPos = cleanText.indexOf(segment.text, currentPos);
        segmentStartPositions.push(segmentPos >= 0 ? segmentPos : currentPos);
        currentPos = (segmentPos >= 0 ? segmentPos : currentPos) + segment.text.length;
    }

    console.log(`[LowTechVoice] Found ${segments.length} emotional segment(s):`,
        segments.map(s => `${s.emotion}: "${s.text.substring(0, 30)}..."`));

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const segmentStartPos = segmentStartPositions[i];
        let processedText = segment.text;

        // Apply DALEK-STYLE transformations based on emotion
        switch (segment.emotion) {
            case 'angry':
                // SHOUTING, syllable breaks, mechanical pauses
                processedText = transformToDalekStyle(processedText, 'high');
                processedText = addSyllableBreaks(processedText);
                processedText = addMechanicalPauses(processedText, false);
                console.log('[LowTechVoice] 😠 ANGRY DALEK MODE');
                break;

            case 'threatening':
            case 'sinister':
                // Syllable breaks, slow mechanical delivery
                processedText = addSyllableBreaks(processedText);
                processedText = addMechanicalPauses(processedText, true); // Pause every word
                processedText = transformToDalekStyle(processedText, 'medium');
                console.log('[LowTechVoice] 😈 THREATENING DALEK MODE');
                break;

            case 'urgent':
            case 'excited':
                // High intensity shouting
                processedText = transformToDalekStyle(processedText, 'high');
                processedText = addSyllableBreaks(processedText);
                console.log('[LowTechVoice] ⚡ URGENT DALEK MODE');
                break;

            case 'mocking':
                // Exaggerated emphasis on key words
                processedText = transformToDalekStyle(processedText, 'medium');
                processedText = addDramaticPauses(processedText);
                console.log('[LowTechVoice] 😏 MOCKING DALEK MODE');
                break;

            case 'disappointed':
                // Slow, deliberate, emphasized
                processedText = addMechanicalPauses(processedText, false);
                processedText = transformToDalekStyle(processedText, 'low');
                console.log('[LowTechVoice] 😔 DISAPPOINTED DALEK MODE');
                break;

            case 'calculating':
                // Slow, syllable breaks
                processedText = addSyllableBreaks(processedText);
                processedText = addMechanicalPauses(processedText, false);
                console.log('[LowTechVoice] 🤔 CALCULATING DALEK MODE');
                break;

            default:
                // Neutral: Still add some mechanical character
                processedText = transformToDalekStyle(processedText, 'low');
                processedText = addDramaticPauses(processedText);
                console.log('[LowTechVoice] 🤖 NEUTRAL DALEK MODE');
                break;
        }

        console.log(`[LowTechVoice] ========================================`);
        console.log(`[LowTechVoice] SEGMENT ${i+1}/${segments.length}`);
        console.log(`[LowTechVoice] Original: "${segment.text}"`);
        console.log(`[LowTechVoice] Transformed: "${processedText}"`);
        console.log(`[LowTechVoice] Emotion: ${segment.emotion}`);
        console.log(`[LowTechVoice] Voice Settings:`, EMOTION_PRESETS[segment.emotion]);
        console.log(`[LowTechVoice] ========================================`);

        // Create a word boundary callback that maps to original text position
        const segmentWordCallback: WordBoundaryCallback | undefined = onProgress
            ? (charIndex: number) => {
                // Map the transformed text position back to approximate original position
                // This is an approximation since transformations change text length
                const ratio = segment.text.length / processedText.length;
                const approxOriginalPos = Math.min(
                    segmentStartPos + Math.floor(charIndex * ratio),
                    segmentStartPos + segment.text.length
                );
                onProgress(approxOriginalPos);
            }
            : undefined;

        await speakWithEmotion(processedText, segment.emotion, language, segmentWordCallback);

        // Signal end of segment
        if (onProgress) {
            onProgress(segmentStartPos + segment.text.length);
        }

        // Longer pause between emotional segments for dramatic effect
        if (i < segments.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 600));
        }
    }

    // Signal completion
    if (onProgress) {
        onProgress(cleanText.length);
    }

    console.log('[LowTechVoice] ✅ Finished speaking AI response');
};

/**
 * Test function to try different voices
 */
export const testVoice = (voiceName: string, text: string = 'I am Zyber'): void => {
    const voices = getAvailableVoices();
    const voice = voices.find(v => v.name === voiceName);
    
    if (!voice) {
        console.error('Voice not found:', voiceName);
        return;
    }
    
    speakLowTech(text, {
        ...RETRO_VOICE_PRESETS.robot,
        voiceName: voice.name
    }).catch(console.error);
};

/**
 * List all available voices (for debugging)
 */
export const listVoices = (): void => {
    const voices = getAvailableVoices();
    console.log('Available voices:', voices.length);
    voices.forEach((voice, i) => {
        console.log(`${i + 1}. ${voice.name} (${voice.lang}) ${voice.localService ? '[Local]' : '[Remote]'}`);
    });
};

/**
 * List available voices by language
 */
export const listVoicesByLanguage = (): void => {
    const voices = getAvailableVoices();
    
    console.log('\n=== VOICES BY LANGUAGE ===\n');
    
    Object.entries(LANGUAGE_MAP).forEach(([appLang, browserLangs]) => {
        const langVoices = voices.filter(v => 
            browserLangs.some(code => v.lang.toLowerCase().startsWith(code.toLowerCase()))
        );
        
        const langNames: Record<string, string> = {
            'en': 'ENGLISH',
            'no': 'NORWEGIAN',
            'pl': 'POLISH',
            'uk': 'UKRAINIAN'
        };
        
        console.log(`${langNames[appLang] || appLang.toUpperCase()} (${appLang}):`);
        
        if (langVoices.length === 0) {
            console.log('  ❌ No voices available for this language');
        } else {
            langVoices.forEach((voice, i) => {
                const markers = [];
                if (voice.default) markers.push('DEFAULT');
                if (voice.name.toLowerCase().includes('male')) markers.push('MALE');
                if (voice.name.toLowerCase().includes('female')) markers.push('FEMALE');
                if (voice.localService) markers.push('LOCAL');
                
                console.log(`  ${i + 1}. ${voice.name} (${voice.lang}) ${markers.length ? '[' + markers.join(', ') + ']' : ''}`);
            });
            
            const selected = findRoboticVoice(appLang);
            if (selected) {
                console.log(`  ✅ SELECTED: ${selected.name}`);
            }
        }
        console.log('');
    });
};

// Initialize voices on load
if (isSpeechSynthesisSupported()) {
    // Voices load asynchronously, so we need to wait
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            console.log('[LowTechVoice] Voices loaded:', getAvailableVoices().length);
        });
    }
}

