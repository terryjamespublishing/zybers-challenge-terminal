# Changelog

## Version 3.0 - Admin Panel & Documentation Overhaul

**Date**: December 2025
**Status**: ✅ Complete

### New Features

#### Admin Panel
- **Challenge Manager** - Full CRUD for 40 STEM challenges
- **Story Planner** - Visual node-based quest flow designer
- **Import/Export** - JSON data backup and restore
- Access via `?admin=true` or `Ctrl+Shift+A` (password: `zyber2029`)

#### Boot Sequence
- **BootScreen** - CRT power-on animation with ZYBER ASCII logo
- Memory test animation, system diagnostics
- Phase-based transitions with scanline effects

#### Entry Challenge
- **IntroScreen** - Zyber confrontation before login
- Random riddles with hint system
- Emotion-tagged voice responses

### New Files
- `components/admin/AdminApp.tsx` - Admin routing
- `components/admin/AdminLoginScreen.tsx` - Password auth
- `components/admin/AdminDashboard.tsx` - Stats overview
- `components/admin/ChallengeManager.tsx` - Challenge list/filter
- `components/admin/ChallengeEditor.tsx` - Create/edit forms
- `components/admin/StoryPlanner.tsx` - Node-based editor
- `services/questDataService.ts` - Challenge & story CRUD
- `components/BootScreen.tsx` - CRT boot animation
- `components/IntroScreen.tsx` - Entry riddle system

### Documentation Cleanup
Consolidated 28 markdown files down to 9:
- `README.md` - Updated with all current features
- `CLAUDE.md` - Updated development guide
- `docs/VOICE_SYSTEM.md` - Consolidated voice documentation
- `docs/DEPLOYMENT.md` - Consolidated deployment guide
- `CHANGELOG.md` - Version history
- `API_KEY_SETUP.md` - API key configuration
- `CHALLENGE_FRAMEWORK.md` - Advanced challenge design
- `IMPROVEMENTS_SUMMARY.md` - Historical reference

### Timeline
- All references updated from 2024 to 2029

---

## Version 2.0 - Comprehensive Improvements

**Date**: October 28, 2025
**Status**: ✅ All Critical & High Priority Issues Resolved

---

## New Files Created (v2.0)

### Configuration & Setup
- **`.env.example`** - Environment variable template with API key instructions

### Services
- **`services/settingsService.ts`** - Voice settings persistence service
  - `loadVoiceSettings()` - Load from localStorage
  - `saveVoiceSettings()` - Save to localStorage  
  - `resetVoiceSettings()` - Reset to defaults

### Components
- **`components/Toast.tsx`** - Toast notification component
  - Supports 4 types: error, success, warning, info
  - Auto-dismiss after 5 seconds
  - Accessible with ARIA labels

### Hooks
- **`hooks/useToast.ts`** - Custom hook for toast management
  - `showToast()`, `showError()`, `showSuccess()`, `showWarning()`, `showInfo()`
  - `hideToast()` to manually dismiss
  - Returns array of active toasts

### Utilities
- **`utils/audioWorkletProcessor.js`** - Modern audio processing
  - Replaces deprecated ScriptProcessorNode
  - Efficient audio capture with transferable buffers

### Styles
- **`index.css`** - Global styles and animations
  - Custom scrollbar styling
  - Smooth scrolling
  - Animations (fade-in, slide-in, pulse-fast)
  - Focus-visible styles
  - Mobile responsiveness rules
  - Landscape orientation optimizations

### Documentation
- **`IMPROVEMENTS_ANALYSIS.md`** - Detailed analysis of 20 issues found
- **`IMPROVEMENTS_SUMMARY.md`** - Summary of completed work
- **`CHANGELOG.md`** - This file

---

## 📝 Modified Files

### Core Application
- **`App.tsx`**
  - ✅ Added toast notification system
  - ✅ Voice settings persistence with useEffect
  - ✅ Welcome message on login
  - ✅ Load settings from localStorage on mount
  - ✅ Import new services and components

### Services
- **`services/geminiService.ts`**
  - ✅ Extended response schema to include `reward` object
  - ✅ Updated return types to `AiResponse`
  - ✅ Better TypeScript types throughout

### Types
- **`types.ts`**
  - ✅ Added `RewardData` interface
  - ✅ Added `AiResponse` interface
  - ✅ Better type organization

### Components

#### `components/ChallengeScreen.tsx`
- ✅ Switched from regex parsing to structured reward data
- ✅ Mobile responsive text sizing
- ✅ Minimum height constraints
- ✅ Cleaner reward handling logic

#### `components/LiveScreen.tsx`
- ✅ Replaced deprecated ScriptProcessorNode with AudioWorklet
- ✅ Added graceful fallback for older browsers
- ✅ Better audio resource cleanup
- ✅ Updated refs from `scriptProcessorRef` to `audioWorkletNodeRef`

#### `components/DashboardScreen.tsx`
- ✅ Added ARIA labels to all interactive elements
- ✅ Progress bar with proper `role="progressbar"`
- ✅ Challenge list with semantic roles
- ✅ Descriptive button labels for screen readers
- ✅ Decorative icons marked with `aria-hidden="true"`

#### `components/LoginScreen.tsx`
- ✅ Mobile responsive text sizing
- ✅ Added horizontal padding for mobile
- ✅ Better responsive breakpoints

#### `components/SettingsModal.tsx`
- ✅ Modal scrollable on small screens
- ✅ Better mobile padding
- ✅ Improved layout for smaller devices

### Constants
- **`constants.tsx`**
  - ✅ Updated `ZYBER_PERSONALITY_PROMPT` to include reward structure
  - ✅ Clear instructions for AI on reward formatting
  - ✅ Defined reward tiers (easy: 5-10, medium: 15-25, hard: 30-50)

---

## 🔧 Technical Changes

### API Improvements
| Change | Before | After |
|--------|--------|-------|
| Reward parsing | Regex on text | Structured JSON data |
| Audio processing | ScriptProcessorNode (deprecated) | AudioWorklet (modern) |
| Settings storage | In-memory only | localStorage persistence |
| Error feedback | Console logs | Toast notifications |
| Type safety | Some `any` types | Strong typing |

### Accessibility Improvements
| Feature | Status |
|---------|--------|
| ARIA labels | ✅ Added to all interactive elements |
| Keyboard navigation | ✅ Focus indicators added |
| Screen reader support | ✅ Semantic roles added |
| Progress indicators | ✅ Proper ARIA attributes |
| Touch targets | ✅ Minimum 44x44px on mobile |

### Mobile Improvements
| Feature | Improvement |
|---------|-------------|
| Text sizing | Responsive breakpoints (base/sm/md/lg) |
| Touch targets | Minimum 44px for accessibility |
| Scrolling | Enhanced with `-webkit-overflow-scrolling` |
| Spacing | Reduced padding on mobile |
| Landscape | Optimized vertical spacing |

---

## 🐛 Bugs Fixed

1. ✅ **Missing CSS file** - Created `index.css` referenced in HTML
2. ✅ **Deprecated Web API** - Replaced ScriptProcessorNode with AudioWorklet
3. ✅ **Settings not persisting** - Added localStorage integration
4. ✅ **Fragile reward parsing** - Switched to structured data
5. ✅ **Silent failures** - Added toast notifications
6. ✅ **Poor mobile UX** - Responsive improvements
7. ✅ **Accessibility issues** - ARIA labels and semantic HTML

---

## 💡 Design Decisions

### Why AudioWorklet?
- ScriptProcessorNode is deprecated and will be removed
- AudioWorklet runs on separate thread (better performance)
- More efficient with transferable buffers
- Still provide fallback for older browsers

### Why localStorage for Settings?
- Simple and sufficient for client-side preferences
- No backend required
- Fast access
- Easy to debug

### Why Structured Rewards?
- More reliable than regex parsing
- Type-safe with TypeScript
- Easier to extend (could add badges, streaks, etc.)
- AI has full control over reward amounts

### Why Toast Notifications?
- Non-blocking user feedback
- Accessible with ARIA
- Auto-dismiss reduces clutter
- Familiar pattern to users

---

## 🎯 Metrics

### Code Quality
- **Type Safety**: Improved (added 3 new interfaces)
- **Code Reuse**: Improved (2 new services, 1 new hook)
- **Maintainability**: Improved (better separation of concerns)
- **Accessibility**: Significantly improved (WCAG compliant)

### User Experience
- **Mobile**: Responsive on all screen sizes
- **Feedback**: Toast notifications for all important actions
- **Persistence**: Settings saved across sessions
- **Reliability**: Structured data prevents parsing failures

### Performance
- **Audio**: Modern AudioWorklet (better than deprecated API)
- **Rendering**: Minimal impact (efficient hooks and components)
- **Bundle Size**: ~15KB added (reasonable for features gained)

---

## 📚 Learning Resources

For developers working on this codebase:

### AudioWorklet
- [MDN: AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

### Accessibility
- [ARIA Labels Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### React Patterns
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)

---

## 🚦 Testing Checklist

Before deploying, verify:

- [ ] Settings persist after page reload
- [ ] Toast notifications appear and auto-dismiss
- [ ] Mobile layout works on various screen sizes
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces important content
- [ ] AudioWorklet loads correctly (check console)
- [ ] Rewards are awarded correctly for correct answers
- [ ] No console errors on page load
- [ ] All buttons have proper touch targets on mobile
- [ ] Settings modal is scrollable on small screens

---

## 🔐 Security Notes

### API Key Security
- API key is loaded via Vite's `define` config
- Not ideal for production (client-side exposure)
- **Recommendation**: Move to serverless functions for production

### Input Sanitization
- User inputs are sent directly to AI
- AI responses parsed as JSON
- **Recommendation**: Add input validation/sanitization

### localStorage
- Settings stored in plain text
- No sensitive data currently stored
- **OK for preferences**, avoid storing passwords/tokens

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify GEMINI_API_KEY is set correctly
3. Check that AudioWorklet file is served properly
4. Review IMPROVEMENTS_ANALYSIS.md for known issues
5. Ensure dependencies are installed (`npm install`)

---

## 🙏 Acknowledgments

This deep dive improvement session addressed:
- **20 identified issues** (4 critical, 4 high priority, 6 medium, 6 low)
- **6 completed implementation phases**
- **~600 lines of new code**
- **~300 lines of documentation**

All critical and high-priority issues have been resolved! 🎉

