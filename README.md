# 🖥️ Zyber's Challenge Terminal

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/zybers-challenge-terminal)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)

**An 80s hacker-themed educational app powered by Google Gemini AI**

[🎮 Live Demo](#) • [📚 Documentation](#documentation) • [🚀 Quick Start](#quick-start) • [🤝 Contributing](#contributing)

</div>

---

## ✨ Features

### 🧠 **Adaptive AI Tutor**
- Powered by Google Gemini 2.5
- Adjusts difficulty based on performance
- Covers logic, math, science, literature, and geography
- European-focused content (metric units, local references)

### 🎯 **Challenge Categories**
- **Logic Puzzles** - Test your reasoning skills
- **Creative Problems** - Think outside the box
- **Code Riddles** - Solve programming challenges

### 🎤 **Live Voice Chat**
- Real-time conversation with Zyber AI
- Text-to-speech with vocoder effects
- Multi-language support (EN, NO, PL, UK)

### 🏆 **Progression System**
- Earn XP and level up
- Collect Data Bits currency
- Unlock Access Keys
- Track your progress

### 🎨 **Retro Terminal UI**
- Authentic 80s hacker aesthetic
- VT323 monospace font
- Green phosphor screen effect
- Blinking cursor animations

### ♿ **Accessible & Responsive**
- WCAG compliant
- Mobile-friendly design
- Keyboard navigation
- Screen reader support

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/zybers-challenge-terminal.git
cd zybers-challenge-terminal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Start development server
npm run dev
```

Visit `http://localhost:3000` 🎉

---

## 📦 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/zybers-challenge-terminal)

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Don't forget to add `GEMINI_API_KEY` in Vercel environment variables!**

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🛠️ Tech Stack

- **Framework**: React 19.2 + TypeScript
- **Build Tool**: Vite 6.2
- **AI**: Google Gemini 2.5 (Pro & Flash)
- **Audio**: Web Audio API + AudioWorklet
- **Styling**: Tailwind CSS (CDN)
- **Font**: VT323 (Google Fonts)

---

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started quickly
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deploy to GitHub & Vercel
- **[IMPROVEMENTS_ANALYSIS.md](./IMPROVEMENTS_ANALYSIS.md)** - Technical analysis
- **[IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md)** - What's been improved
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history

---

## 🎮 How to Play

1. **Create Account** - Choose a username and password
2. **Configure Voice** - Adjust settings (language, gender, vocoder effect)
3. **Select Challenge** - Pick from Logic, Creative, or Code challenges
4. **Start Learning** - Answer questions to earn rewards
5. **Level Up** - Gain XP and unlock new content

---

## 🎨 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x500?text=Dashboard+Screenshot)

### Challenge Screen
![Challenge](https://via.placeholder.com/800x500?text=Challenge+Screenshot)

### Settings Modal
![Settings](https://via.placeholder.com/800x500?text=Settings+Screenshot)

---

## 🗺️ Roadmap

### ✅ Completed (v2.0)
- [x] Voice settings persistence
- [x] Toast notifications
- [x] Modern AudioWorklet API
- [x] Mobile responsive design
- [x] Accessibility improvements
- [x] Structured reward system

### 🚧 In Progress
- [ ] Decryption Hub shop implementation
- [ ] More challenge categories
- [ ] Achievement system

### 📅 Planned
- [ ] Leaderboard
- [ ] Challenge history
- [ ] Daily challenges
- [ ] Profile customization
- [ ] Offline mode

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Add TypeScript types
- Test on mobile devices
- Update documentation
- Add accessibility features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - Powers the adaptive tutoring
- **AI Studio** - Original project base
- **VT323 Font** - Authentic terminal aesthetic
- **Vercel** - Hosting and deployment

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/zybers-challenge-terminal/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/zybers-challenge-terminal/discussions)
- **Email**: your.email@example.com

---

## ⚠️ Security Notice

**API Key Warning**: The current implementation exposes the Gemini API key in the client-side code. For production use, consider implementing a backend API proxy to protect your API key.

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=YOUR_USERNAME/zybers-challenge-terminal&type=Date)](https://star-history.com/#YOUR_USERNAME/zybers-challenge-terminal&Date)

---

<div align="center">

**Built with ❤️ for learning and education**

[🔝 Back to Top](#-zybers-challenge-terminal)

</div>
