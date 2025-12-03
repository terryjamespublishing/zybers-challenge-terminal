# Voice System Documentation

## Overview

Zyber's voice system uses browser-based SpeechSynthesis with emotional variations to create a menacing, robotic AI character. The system processes emotion markers in text and applies different pitch/rate settings to create dramatic voice effects.

## Architecture

### Voice Processing Flow
```
AI Response → Parse Emotion Tags → Apply Voice Settings → SpeechSynthesis Output
```

### Key Files
- `utils/lowTechVoice.ts` - Main voice processing with emotion markers
- `utils/voiceEffects.ts` - Advanced Web Audio API effects (optional)
- `services/settingsService.ts` - Voice settings persistence

## Emotion System

The AI includes emotion markers in responses that control voice characteristics:

| Emotion | Pitch | Rate | Description |
|---------|-------|------|-------------|
| **NEUTRAL** (default) | 0.1 | 0.5 | Deep, menacing, deliberate |
| THREATENING | 0.1 | 0.4 | Even slower, more menacing |
| SINISTER | 0.1 | 0.3 | Extremely slow, evil |
| DISAPPOINTED | 0.2 | 0.5 | Low, dejected |
| CALCULATING | 0.2 | 0.4 | Processing, thinking |
| WHISPER | 0.4 | 0.6 | Quiet, secretive |
| TRIUMPHANT | 0.8 | 1.0 | Confident, victorious |
| IMPATIENT | 1.0 | 1.9 | Fast, irritated |
| MOCKING | 1.3 | 0.7 | High, sarcastic |
| ANGRY | 1.8 | 2.0 | Very high, screaming |
| URGENT | 1.4 | 2.0 | Alarm-like, emergency |
| EXCITED | 2.0 | 2.0 | Maximum high, maximum fast |

### Usage in AI Responses
```
[ANGRY] Wrong! [DISAPPOINTED] I expected better. [NEUTRAL] Try again.
```

Each phrase is spoken with different voice settings for dramatic effect.

## Voice Presets (Advanced Effects)

When `useAdvancedEffects` is enabled, these presets apply Web Audio API processing:

### ZYBER (Default)
- Balanced synthetic + menacing
- Pitch: -4 semitones, 8-bit audio, 25% distortion, 80 Hz ring mod

### HAWKING
- Stephen Hawking style - clear, robotic
- Pitch: -3 semitones, 10-bit audio, minimal distortion

### MENACING
- Dark, threatening, sinister
- Pitch: -6 semitones, 6-bit audio, 35% distortion

### GLITCHY
- Unstable, digital, aggressive
- Pitch: -5 semitones, 4-bit audio, 50% distortion

### MINIMAL
- No effects, original TTS output

## Settings

Voice settings are stored in localStorage and include:
- `language`: en-GB, nb-NO, pl-PL, uk-UA
- `gender`: male | female
- `vocoderEnabled`: Legacy vocoder toggle
- `uiSoundsEnabled`: Keyboard/UI sound effects
- `useAdvancedEffects`: Enable Web Audio effects
- `voicePreset`: zyber | hawking | menacing | glitchy | minimal

## Multi-Language Support

Works in all 4 languages with same emotional range:
- English (UK)
- Norwegian
- Polish
- Ukrainian

## Troubleshooting

### Voice Not Speaking
1. Check browser supports SpeechSynthesis
2. Ensure page has user interaction first (browser requirement)
3. Check console for errors
4. Verify voice settings in localStorage

### Voice Sounds Wrong
1. Clear localStorage: `localStorage.removeItem('zyber_voice_settings')`
2. Refresh page
3. Test in Settings → [TEST VOICE]

### Audio Not Working
1. Check browser console for AudioContext errors
2. Ensure no other tabs are using audio heavily
3. Try different browser (Chrome recommended)

### AudioWorklet Issues
```javascript
// Check if AudioWorklet loaded
console.log('AudioContext state:', audioContext.state);
```

## Technical Details

### Web Audio API Chain (Advanced Effects)
```
Audio Input
    ↓
Bitcrusher (digital quality)
    ↓
Formant Filter (robotic vocals)
    ↓
Ring Modulation (vocoder)
    ↓
Resonant Filter (metallic tone)
    ↓
Distortion (menacing edge)
    ↓
Reverb (presence)
    ↓
Output
```

### Performance
- Minimal preset: ~5% CPU
- ZYBER preset: ~20% CPU
- MENACING preset: ~25% CPU
- Effect processing: <10ms latency

## Integration Points

### ChallengeScreen
```typescript
import { speakAIResponse, stopSpeaking } from '../utils/lowTechVoice';

// Speak AI response with emotion parsing
await speakAIResponse(response.spokenText, voiceSettings.language);
```

### SettingsModal
```typescript
// Test voice with multiple emotions
await speakAIResponse(
  '[THREATENING] Testing. [SINISTER] Zyber voice. [ANGRY] Active!',
  voiceSettings.language
);
```

### IntroScreen
```typescript
// Speak Zyber's confrontational dialogue
await speakAIResponse(dialogueText, voiceSettings.language);
```
