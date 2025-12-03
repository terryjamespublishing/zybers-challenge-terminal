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
BootScreen → IntroScreen → LoginScreen → DashboardScreen → Challenge
                                              ↓                 ↓
                                         Admin Panel      LiveScreen (Voice Chat)
                                    (via ?admin=true      (type "VOICE CHAT")
                                     or Ctrl+Shift+A)
```

### Main Screens

- **BootScreen** (`components/BootScreen.tsx`): CRT power-on animation with ZYBER ASCII logo, memory test, system diagnostics. Duration ~20 seconds.
- **IntroScreen** (`components/IntroScreen.tsx`): Interactive confrontation where Zyber challenges users with random riddles before granting access. Uses emotion-tagged TTS.
- **LoginScreen**: Simple username/password creation (stored in localStorage)
- **DashboardScreen**: Central hub featuring the **Eye of Zyber** - a large animated eye that follows the cursor, blinks, and glitches. Click to start the current challenge.
- **ChallengeScreen**: Generic AI-powered challenge interface (fallback for challenges without custom puzzles)
- **LiveScreen** (`components/LiveScreen.tsx`): Real-time voice conversation with Zyber using Gemini Live API. Requires microphone access.

### Voice Chat Command

During any challenge, type `VOICE CHAT` in the input and press Enter to switch to real-time voice conversation mode. This uses Gemini's Live API for bidirectional audio:
- Requests microphone permission
- Streams user speech to Gemini in real-time
- Zyber responds with synthesized voice
- Press exit button to return to dashboard

### The Eye of Zyber (`components/ZyberEye.tsx`)

The main visual element of the dashboard:
- Animated eye that tracks mouse cursor movement
- Random blinking and glitch effects
- Circuit board decorations
- Phosphor glow effects matching CRT aesthetic
- Click to initiate current challenge

### Stats System

- **StatsIcon** (`components/StatsIcon.tsx`): Hacker-themed icon in top-right corner, shows user level on hover
- **StatsScreen** (`components/StatsScreen.tsx`): Modal showing full user stats, challenge progress, difficulty breakdown, streak tracking

### Challenge Timer (`components/ChallengeTimer.tsx`)

Always-visible 30-minute countdown during challenges:
- Fixed position at top center
- Color changes: Green → Yellow (5 min warning) → Red (1 min critical)
- Pulses when time is critical
- Progress bar underneath

### Progress Service (`services/progressService.ts`)

Tracks user's challenge progression:
- `getCurrentChallenge()`: Get the next challenge in sequence
- `getSortedChallenges()`: Challenges sorted by difficulty (easy → medium → hard)
- `completeCurrentChallenge(timeSpent)`: Mark complete and advance
- `getProgressStats()`: Get completion stats, streaks, time played
- `resetProgress()`: Reset for testing

## Interactive Puzzle System

### Challenge Routing (in `App.tsx`)

Challenges are routed to custom puzzle components based on their ID:
```typescript
if (currentChallenge.id === 1) {
  return <GasLeakChallenge ... />;
}
// Add more puzzle routes here as they're created
```

### Puzzle Components (`components/puzzles/`)

#### GasLeakChallenge (`puzzles/GasLeakChallenge.tsx`)
**Challenge ID: 1** - Baking Soda & Vinegar Balloon Inflation

Multi-phase challenge:
1. **Intro Phase**: Zyber announces gas leak in Sector 7 with speech-synced text display
2. **Puzzle Phase**: CircuitPuzzle (Medium difficulty 9x9) - clean UI focused on puzzle
3. **Valve Closing Phase**: Animated valve rotation, gas level dropping
4. **Physical Challenge Phase**: Instructions for real-world balloon experiment

Visual effects: Floating gas particles, warning banners, electrical crackling on powered wires

#### CircuitPuzzle (`puzzles/CircuitPuzzle.tsx`)

Interactive wire-routing puzzle with significant difficulty:
- Grid of rotatable wire pieces (straight, corner, T-junction, cross)
- Click to rotate pieces 90 degrees
- **PWR source**: Single exit point (right only) with crackling spark effects
- **VALVE target**: Single entry point (left only) - sparks when power reaches it
- **Real-time power illumination**: Connected wires glow green with electrical crackling
- **Electrical effects**: Flickering glow, traveling sparks along powered wires
- Difficulty adjusts grid size: **Easy 7x7 / Medium 9x9 / Hard 11x11**
- Blocked cells (red X): **5 / 10 / 16** based on difficulty
- Winding paths: Algorithm forces long routes (**55%+ of grid cells**)
- Decoy paths: **2 / 4 / 6** false routes based on difficulty
- Path must exit source going RIGHT and enter target from LEFT
- Heavy use of T-junctions and crosses to create false connection points
- **Anti-cheat**: Re-scrambles if randomly solved on generation
- Guaranteed solvable: generates winding path first, avoids blocked cells, then scrambles

### Adding New Puzzle Challenges

1. Create component in `components/puzzles/YourPuzzle.tsx`
2. Add routing in `App.tsx` under the Challenge case:
   ```typescript
   if (currentChallenge.id === YOUR_ID) {
     return <YourPuzzle onComplete={...} onExit={...} voiceSettings={...} />;
   }
   ```
3. Puzzle should call `onComplete()` when solved

## Challenge Database (`zyber_quest_data.json`)

41 challenges organized by category and difficulty:
- **Categories**: Chemistry, Physics, Observation, Engineering, Logic
- **Difficulty**: 1 (easy), 2 (medium), 3 (hard)
- Each challenge has: name, description, materials, learning_objectives, safety_notes, story_ideas

Challenges are presented sequentially, sorted by difficulty.

## Keyboard Shortcuts

### Boot Screen
- `SPACE` - Skip boot sequence

### Admin Panel
Access via `?admin=true` URL parameter or `Ctrl+Shift+A`. Password: `zyber2029`

**Dashboard shortcuts:**
- `1` - Challenge Manager
- `2` - Story Planner
- `3` - User Management
- `4` - Puzzle Tester
- `N` - New Challenge
- `ESC` - Go back / Exit to game

Located in `components/admin/`:
- **ChallengeManager.tsx**: View/filter/edit/delete challenges
- **ChallengeEditor.tsx**: Create/edit challenge forms
- **StoryPlanner.tsx**: Visual node-based story arc editor
- **UserManager.tsx**: Manage player accounts and progress
- **PuzzleTester.tsx**: Test terminal-based puzzles in isolation

#### Puzzle Tester (`components/admin/PuzzleTester.tsx`)

Developer tool for testing terminal-based challenges:
- Lists all available puzzle components
- Difficulty selector (Easy/Medium/Hard) for puzzles that support it
- Launches puzzles in full CRT terminal mode
- [ESC] EXIT TEST button to return to admin panel
- Voice synthesis enabled with Zyber preset

To add a new puzzle to the tester, update the `availablePuzzles` array in `PuzzleTester.tsx`:
```typescript
{
  id: 'your-puzzle',
  name: 'Your Puzzle Name',
  description: 'What this puzzle tests',
  component: 'your-puzzle',  // Used in switch statement
  hasDifficulty: true,       // Show difficulty selector
}
```

## Services

### Quest Data Service (`services/questDataService.ts`)
CRUD operations for challenges and stories with localStorage persistence.

### Progress Service (`services/progressService.ts`)
User challenge progression tracking.

### AI Integration (`services/geminiService.ts`)
Uses Google Gemini models for challenge generation and chat responses.

### Voice System

- **Browser TTS** (`utils/lowTechVoice.ts`): Web Speech API with emotion markers `[MOCKING]`, `[SINISTER]`, `[CALCULATING]`, etc.
- **Advanced Effects** (`utils/voiceEffects.ts`): Web Audio API processing chain

## Key Types (`types.ts`)

- `User`: username, level, xp, dataBits, accessKeys
- `QuestChallenge`: id, name, category, difficulty, materials, description, learning_objectives
- `VoiceSettings`: language, gender, vocoderEnabled, voicePreset

## Styling

- Tailwind CSS via CDN
- CRT effects in `index.css`: scanlines, phosphor glow, vignette, chromatic aberration
- VT323 monospace font
- Colors: `--primary` (green #00ff41), `--accent` (cyan), `--bg` (dark)

## Zyber Personality

Defined in `constants.tsx`:
- Sarcastic, adversarial 80s terminal AI
- Uses emotion markers in speech: `[MOCKING]`, `[SINISTER]`, `[CALCULATING]`, `[TRIUMPHANT]`, etc.
- European context, ages 10-16
- All responses end with `▋` (blinking cursor)

**Reactive Conversation**: Zyber is designed to engage with what users actually say:
- References and twists the user's own words back at them
- Mocks specific statements ("Beat ME? You can barely solve basic arithmetic.")
- When users give wrong answers, references their actual answer, not just generic "wrong"
- Reacts to user's tone - dismissive if confident, condescending if struggling

## Next Steps / TODO

- [ ] Create custom puzzle components for challenges 2-41
- [ ] Each challenge should have a unique interactive puzzle + physical activity
- [ ] Puzzle ideas from database: magnet retrieval, pattern recognition, cipher decoding, etc.
