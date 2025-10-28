import { GoogleGenAI, Content, LiveServerMessage, Blob, Modality, Type } from "@google/genai";
import { ZYBER_PERSONALITY_PROMPT } from '../constants';
import { decode, encode } from '../utils/audioUtils';
import { VoiceSettings, AiResponse } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        displayText: {
            type: Type.STRING,
            description: 'The full text to display on the terminal screen. This can include code, numbers, and detailed explanations.'
        },
        spokenText: {
            type: Type.STRING,
            description: 'A concise version of the response for text-to-speech. This should be brief and conversational. It must not contain long strings of numbers, code, or special characters. It should refer to complex on-screen content generically.'
        },
        reward: {
            type: Type.OBJECT,
            description: 'Reward data to give the user if they answered correctly. Set all values to 0 if the answer is incorrect.',
            properties: {
                xp: {
                    type: Type.NUMBER,
                    description: 'Experience points to award (0 if incorrect answer)'
                },
                dataBits: {
                    type: Type.NUMBER,
                    description: 'Data bits to award (0 if incorrect answer, usually same as XP)'
                },
                isCorrect: {
                    type: Type.BOOLEAN,
                    description: 'Whether the user answer was correct'
                }
            },
            required: ['xp', 'dataBits', 'isCorrect']
        }
    },
    required: ['displayText', 'spokenText', 'reward']
};

const getLanguageCode = (language: VoiceSettings['language']): string => {
    switch (language) {
        case 'no': return 'no-NO';
        case 'pl': return 'pl-PL';
        case 'uk': return 'uk-UA';
        case 'en':
        default:
            return 'en-GB';
    }
}

// Dedicated function for the Live API model which requires a different English code.
const getLiveLanguageCode = (language: VoiceSettings['language']): string => {
    switch (language) {
        case 'no': return 'no-NO';
        case 'pl': return 'pl-PL';
        case 'uk': return 'uk-UA';
        case 'en':
        default:
            return 'en-US'; // Use supported 'en-US' for the Live API
    }
};


const getAccentPrompt = (language: VoiceSettings['language']): string => {
    switch (language) {
        case 'no': return 'Pronounce in a native Norwegian accent.';
        case 'pl': return 'Pronounce in a native Polish accent.';
        case 'uk': return 'Pronounce in a native Ukrainian accent.';
        case 'en':
        default:
            return 'Pronounce in a native British English accent.';
    }
}

const getSystemPrompt = (language: VoiceSettings['language']): string => {
    let langInstruction = '';
    let accentInstruction = '';
    switch (language) {
        case 'no':
            langInstruction = 'You MUST respond in Norwegian.';
            accentInstruction = 'Your spokenText MUST be pronounced with a native Norwegian accent.';
            break;
        case 'pl':
            langInstruction = 'You MUST respond in Polish.';
            accentInstruction = 'Your spokenText MUST be pronounced with a native Polish accent.';
            break;
        case 'uk':
            langInstruction = 'You MUST respond in Ukrainian.';
            accentInstruction = 'Your spokenText MUST be pronounced with a native Ukrainian accent.';
            break;
        case 'en':
        default:
            langInstruction = 'You MUST respond in English.';
            accentInstruction = 'Your spokenText MUST be pronounced with a native British English accent.';
            break;
    }
    return `${ZYBER_PERSONALITY_PROMPT}\n${langInstruction}\n${accentInstruction}`;
}


// --- Challenge and Chat ---

export const generateChallenge = async (challengePrompt: string, language: VoiceSettings['language']): Promise<AiResponse> => {
    const model = 'gemini-2.5-pro';
    const response = await ai.models.generateContent({
        model,
        contents: challengePrompt,
        config: {
            ...generationConfig,
            systemInstruction: getSystemPrompt(language),
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
    });
    return JSON.parse(response.text);
};

export const getChatResponse = async (history: Content[], newMessage: string, language: VoiceSettings['language']): Promise<AiResponse> => {
    const model = 'gemini-2.5-flash';
    const contents = [...history, { role: 'user', parts: [{ text: newMessage }] }];

    const response = await ai.models.generateContent({
        model,
        contents,
        config: {
            ...generationConfig,
            systemInstruction: getSystemPrompt(language),
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    return JSON.parse(response.text);
};

// --- Text-to-Speech (TTS) ---

const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
};

export const textToSpeech = async (text: string, audioContext: AudioContext, settings: VoiceSettings): Promise<AudioBuffer> => {
    const model = "gemini-2.5-flash-preview-tts";
    const stylePrompt = `Speak in a very deep, low-pitched, ${settings.gender}, menacing, dehumanised, sinister, and sarcastic robotic tone. Keep your speech concise. ${getAccentPrompt(settings.language)} Say:`;
    const promptedText = `${stylePrompt} "${text}"`;
    const voiceName = settings.gender === 'male' ? 'Zubenelgenubi' : 'Kore';

    const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: promptedText }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                languageCode: getLanguageCode(settings.language),
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from TTS API");
    }

    const audioBytes = decode(base64Audio);
    return await decodeAudioData(audioBytes, audioContext, 24000, 1);
};


// --- Live API (Native Audio) ---

export const createAudioBlob = (data: Float32Array): Blob => {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
};


export const connectLive = async (systemInstruction: string, onMessage: (message: LiveServerMessage) => void, settings: VoiceSettings) => {
    let nextStartTime = 0;
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);
    
    let carrierOscillator: OscillatorNode | null = null;
    let finalAudioNode: AudioNode = outputNode; // Default to direct output

    if (settings.vocoderEnabled) {
        const modulatorGain = outputAudioContext.createGain();
        modulatorGain.connect(outputNode);

        carrierOscillator = outputAudioContext.createOscillator();
        carrierOscillator.type = 'sawtooth';
        carrierOscillator.frequency.value = settings.vocoderFrequency;

        const carrierGain = outputAudioContext.createGain();
        carrierGain.gain.value = 0.7; // Modulation depth

        carrierOscillator.connect(carrierGain);
        carrierGain.connect(modulatorGain.gain);
        carrierOscillator.start();
        
        finalAudioNode = modulatorGain; // Route audio through the effect
    }

    const sources = new Set<AudioBufferSourceNode>();
    
    let langInstruction = '';
    let accentInstruction = '';
    switch (settings.language) {
        case 'no':
            langInstruction = 'You MUST respond in Norwegian.';
            accentInstruction = 'Your speech MUST have a native Norwegian accent.';
            break;
        case 'pl':
            langInstruction = 'You MUST respond in Polish.';
            accentInstruction = 'Your speech MUST have a native Polish accent.';
            break;
        case 'uk':
            langInstruction = 'You MUST respond in Ukrainian.';
            accentInstruction = 'Your speech MUST have a native Ukrainian accent.';
            break;
        case 'en':
        default:
            langInstruction = 'You MUST respond in English.';
            accentInstruction = 'Your speech MUST have a native British English accent.';
            break;
    }
    const dynamicSystemInstruction = systemInstruction.replace('{gender}', settings.gender);
    const fullSystemInstruction = `${dynamicSystemInstruction}\n${langInstruction}\n${accentInstruction}`;
    const voiceName = settings.gender === 'male' ? 'Zubenelgenubi' : 'Kore';

    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => console.log('Live connection opened.'),
            onmessage: async (message: LiveServerMessage) => {
                onMessage(message);
                const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    if (outputAudioContext.state === 'suspended') {
                        await outputAudioContext.resume();
                    }
                    nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                    const source = outputAudioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(finalAudioNode);
                    source.addEventListener('ended', () => sources.delete(source));
                    source.start(nextStartTime);
                    nextStartTime += audioBuffer.duration;
                    sources.add(source);
                }
                if (message.serverContent?.interrupted) {
                    for (const source of sources.values()) {
                        source.stop();
                    }
                    sources.clear();
                    nextStartTime = 0;
                }
            },
            onerror: (e) => console.error('Live connection error:', e),
            onclose: () => {
                console.log('Live connection closed.');
                if (carrierOscillator) {
                    carrierOscillator.stop();
                }
            },
        },
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
                languageCode: getLiveLanguageCode(settings.language),
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                }
            },
            systemInstruction: fullSystemInstruction,
        },
    });
};