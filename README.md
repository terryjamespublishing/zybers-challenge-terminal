# Zyber's Challenge Terminal

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)

**An 80s retro hacker-themed educational terminal powered by Google Gemini AI**

*Set in the year 2029*

</div>

---

## About

Zyber's Challenge Terminal is an educational app for ages 10-16 where players interact with **Zyber**, a sarcastic adversarial AI that presents STEM challenges. Features an authentic 1980s CRT terminal aesthetic with voice synthesis, progression systems, and 40+ pre-built challenges.

## Features

### Immersive Experience
- **CRT Boot Sequence** - Authentic power-on animation with ZYBER ASCII logo
- **Entry Riddle** - Prove yourself to Zyber before gaining access
- **Retro Terminal UI** - Phosphor glow, scanlines, VT323 font
- **Robotic Voice** - Browser TTS with emotional variations

### AI-Powered Challenges
- **Adaptive Difficulty** - AI adjusts based on performance
- **Multiple Categories** - Logic, Math, Code, Science, Ciphers
- **Live Voice Chat** - Real-time conversation with Zyber
- **Structured Rewards** - XP, Data Bits, Access Keys

### Admin Panel
- **Challenge Manager** - Create, edit, delete challenges
- **Story Planner** - Visual node-based quest designer
- **User Management** - Manage players, track progress, reset accounts
- **40 Pre-built Challenges** - STEM activities with materials lists
- Access via `?admin=true` or `Ctrl+Shift+A`

### Technical
- **Multi-language** - English, Norwegian, Polish, Ukrainian
- **Mobile Responsive** - Works on all screen sizes
- **Accessible** - WCAG compliant, keyboard navigation
- **Offline Capable** - Challenge data stored locally

---

## Quick Start

### 1. Get API Key (Free)
Visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 2. Setup
```bash
git clone <repository-url>
cd zybers-challenge-terminal
npm install
cp .env.example .env.local
# Add your API key to .env.local
```

### 3. Run
```bash
npm run dev
```

Visit `http://localhost:5173`

---

## Screen Flow

```
BootScreen → IntroScreen → LoginScreen → Dashboard → [Challenge/Live/DecryptionHub]
                                              ↓
                                         Admin Panel (optional)
```

1. **Boot Screen** - CRT warm-up, memory test, system diagnostics
2. **Intro Screen** - Zyber confrontation and entry riddle
3. **Login Screen** - Create account (stored locally)
4. **Dashboard** - ZyberEye interface, click to initiate challenge
5. **Challenge Screen** - AI-generated educational challenges
6. **Live Screen** - Real-time voice conversation
7. **Admin Panel** - Manage challenges and story arcs

---

## Challenge Categories

| Category | Description |
|----------|-------------|
| Logic Puzzles | Reasoning and deduction |
| Creative Problems | Lateral thinking |
| Code Riddles | Programming concepts |
| Pattern Breaker | Number sequences |
| Binary Decoder | Binary/ASCII conversion |
| Cipher Challenges | Morse code, Roman numerals |
| Digital Forensics | Simulated hacking scenarios |

---

## Voice System

Zyber uses browser SpeechSynthesis with emotional variations:

- **NEUTRAL** - Deep, menacing (default)
- **ANGRY** - High-pitched, fast
- **MOCKING** - Sarcastic tone
- **SINISTER** - Extremely slow, evil
- **TRIUMPHANT** - Victorious

Emotion markers in AI responses: `[ANGRY] Wrong! [MOCKING] Try again.`

---

## Admin Panel

Access: `?admin=true` URL parameter or `Ctrl+Shift+A`
Password: `zyber2029`

### Challenge Manager
- View all 40 challenges with filtering
- Edit challenge details, materials, objectives
- Create new challenges
- Delete challenges

### Story Planner
- Visual node-based editor
- Drag-and-drop interface
- Connect challenges into quest flows
- Design branching storylines

### User Management
- View all players and their progress
- Search and filter by status/role
- Edit user details and permissions
- Reset player progress
- Ban/suspend accounts

---

## Tech Stack

- **Framework**: React 19.2 + TypeScript
- **Build**: Vite 6.2
- **AI**: Google Gemini 2.5 (Pro + Flash)
- **Voice**: Web Speech API + Web Audio API
- **Styling**: Tailwind CSS
- **Font**: VT323 (Google Fonts)

---

## Project Structure

```
├── components/
│   ├── admin/           # Admin panel components
│   ├── BootScreen.tsx   # CRT boot animation
│   ├── IntroScreen.tsx  # Zyber entry riddle
│   ├── LoginScreen.tsx  # Account creation
│   ├── DashboardScreen.tsx
│   ├── ChallengeScreen.tsx
│   ├── LiveScreen.tsx   # Voice chat
│   └── SettingsModal.tsx
├── services/
│   ├── geminiService.ts     # AI integration
│   ├── questDataService.ts  # Challenge CRUD
│   ├── settingsService.ts   # Voice settings
│   └── userService.ts       # User data
├── utils/
│   ├── lowTechVoice.ts      # TTS with emotions
│   ├── voiceEffects.ts      # Audio effects
│   └── uiSfx.ts             # UI sounds
├── docs/                    # Documentation
├── zyber_quest_data.json    # 40 challenges
└── constants.tsx            # Zyber personality
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](./CLAUDE.md) | Development guide for Claude Code |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deployment instructions |
| [docs/VOICE_SYSTEM.md](./docs/VOICE_SYSTEM.md) | Voice system details |
| [API_KEY_SETUP.md](./API_KEY_SETUP.md) | API key configuration |
| [CHALLENGE_FRAMEWORK.md](./CHALLENGE_FRAMEWORK.md) | Advanced challenge design |

---

## Environment Variables

```bash
# .env.local
VITE_GEMINI_API_KEY=your_api_key_here
```

---

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production
```

---

## Security Notes

- API key is client-side exposed (use backend proxy for production)
- User data stored in localStorage (no server)
- Admin password is for demo purposes only

---

## License

MIT License - See [LICENSE](LICENSE) file

---

## Credits

- **AI**: Google Gemini
- **Font**: VT323 by Peter Hull
- **Hosting**: Vercel
- **Timeline**: Set in 2029

---

<div align="center">

**Built for education**

[Documentation](#documentation) | [Quick Start](#quick-start) | [Admin Panel](#admin-panel)

</div>
