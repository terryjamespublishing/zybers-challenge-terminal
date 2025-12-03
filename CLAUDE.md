# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zyber's Challenge Terminal is an 80s retro hacker-themed educational app for ages 10-16, powered by Google Gemini AI. Players interact with "Zyber", a sarcastic adversarial AI that presents STEM challenges. The app features a CRT terminal aesthetic, voice synthesis with robotic effects, and a progression system. Set in the year 2029.

## Development Commands

```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
```

## Environment Setup

Requires `VITE_GEMINI_API_KEY` in `.env.local`:
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Get a free key from: https://aistudio.google.com/apikey

## Architecture

### Screen Flow
```
BootScreen → IntroScreen → LoginScreen → DashboardScreen → [Challenge/Live/DecryptionHub]
                                              ↓
                                         Admin Panel (via ?admin=true or Ctrl+Shift+A)
```

- **BootScreen** (`components/BootScreen.tsx`): CRT power-on animation with ZYBER ASCII logo, memory test, system diagnostics. Duration ~20 seconds.
- **IntroScreen** (`components/IntroScreen.tsx`): Interactive confrontation where Zyber challenges users with random riddles before granting access. Uses emotion-tagged TTS.
- **LoginScreen**: Simple username/password creation (stored in localStorage)
- **DashboardScreen**: Challenge category selection, stats display, settings access
- **ChallengeScreen**: AI-powered educational challenges with structured rewards
- **LiveScreen**: Real-time voice chat with Zyber using Gemini Live API
- **DecryptionHubScreen**: Shop interface (partially implemented)

### Admin Panel
Access via `?admin=true` URL parameter or `Ctrl+Shift+A`. Password: `zyber2029`

Located in `components/admin/`:
- **AdminApp.tsx**: Admin routing container with screen state management
- **AdminLoginScreen.tsx**: Password authentication
- **AdminDashboard.tsx**: Stats overview, navigation
- **ChallengeManager.tsx**: View/filter/edit/delete 40 challenges from `zyber_quest_data.json`
- **ChallengeEditor.tsx**: Create/edit challenge forms with all fields
- **StoryPlanner.tsx**: Visual node-based story arc editor with drag-and-drop

### Quest Data Service (`services/questDataService.ts`)

CRUD operations for challenges and stories:
- `loadQuestData()` / `saveQuestData()` - localStorage with JSON file fallback
- `getChallenges()` / `getChallengeById()` / `searchChallenges()`
- `createChallenge()` / `updateChallenge()` / `deleteChallenge()`
- `getStories()` / `createStory()` / `updateStory()` / `deleteStory()`
- `addNodeToStory()` / `updateNodeInStory()` / `connectNodes()`
- `exportQuestData()` / `importQuestData()` - JSON import/export

### AI Integration (`services/geminiService.ts`)

Uses Google Gemini models:
- `gemini-2.5-pro`: Initial challenge generation
- `gemini-2.5-flash`: Chat responses with structured JSON schema
- `gemini-2.5-flash-preview-tts`: Text-to-speech
- `gemini-2.5-flash-native-audio-preview`: Live voice chat

All AI responses use structured JSON with `displayText`, `spokenText`, and `reward` fields.

### Voice System

Two voice processing paths:
1. **Browser TTS** (`utils/lowTechVoice.ts`): Uses Web Speech API with emotion markers like `[MOCKING]`, `[SINISTER]`, `[CALCULATING]`
2. **Advanced Effects** (`utils/voiceEffects.ts`): Web Audio API chain with formant filtering, ring modulation, comb filter, distortion

Voice presets: `zyber`, `hal`, `glados`, `hawking`, `menacing`, `glitchy`, `minimal`

### Data Storage

- **User data**: localStorage via `services/userService.ts`
- **Voice settings**: localStorage via `services/settingsService.ts`
- **Quest challenges**: `zyber_quest_data.json` with localStorage override via `services/questDataService.ts`

### Key Types (`types.ts`)

- `User`: username, level, xp, dataBits, accessKeys
- `VoiceSettings`: language, gender, vocoderEnabled, voicePreset, customEffects
- `QuestChallenge`: id, name, category, difficulty, materials, description, learning_objectives
- `AiResponse`: displayText, spokenText, reward (xp, dataBits, isCorrect)

### Styling

- Tailwind CSS via CDN (configured in `index.html`)
- CRT effects defined in `index.css`: scanlines, phosphor glow, vignette, chromatic aberration
- VT323 monospace font for terminal aesthetic
- Colors: `--primary` (green), `--accent` (cyan), `--bg` (dark)

## Zyber Personality

Defined in `constants.tsx` as `ZYBER_PERSONALITY_PROMPT`:
- Sarcastic, adversarial 80s terminal AI
- Brief, cutting dialogue with retro-terminal flair
- Uses emotion markers: `[NEUTRAL]`, `[MOCKING]`, `[ANGRY]`, `[TRIUMPHANT]`, `[SINISTER]`, `[CALCULATING]`
- All responses end with `▋` (blinking cursor)
- European context, metric units, ages 10-16

## Challenge Categories

Located in `constants.tsx` as `CHALLENGE_CATEGORIES[]`:
- Escape Protocol (timed puzzles)
- Logic Puzzles, Creative Problems, Code Riddles
- Math-focused: Pattern Breaker, Equation Extractor, Percentage Panic
- Advanced: Binary Decoder, ASCII Cipher, Roman Riddle, Morse Code
- Multi-system: Code Breaker Hub, Password Cracker, Digital Forensics
