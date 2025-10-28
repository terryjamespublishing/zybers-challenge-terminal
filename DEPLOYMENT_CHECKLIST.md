# ✅ Deployment Checklist

Use this checklist to ensure smooth deployment to GitHub and Vercel.

---

## 🔧 Pre-Deployment

### Local Setup
- [ ] `.env.local` file exists with valid `GEMINI_API_KEY`
- [ ] App runs locally without errors (`npm run dev`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] All features work as expected
- [ ] No console errors in browser

### Code Quality
- [ ] All files committed (check `git status`)
- [ ] No sensitive data in code (API keys, passwords)
- [ ] `.gitignore` is configured correctly
- [ ] `vercel.json` exists with proper configuration

---

## 📦 GitHub Setup

### Repository Creation
- [ ] GitHub account created/logged in
- [ ] Repository created (public or private)
- [ ] Repository name: `zybers-challenge-terminal`
- [ ] Git initialized locally (`git init`)
- [ ] Remote added (`git remote add origin <url>`)

### First Push
- [ ] All files added (`git add .`)
- [ ] Initial commit created (`git commit -m "Initial commit"`)
- [ ] Pushed to main branch (`git push -u origin main`)
- [ ] Repository visible on GitHub

### Verify on GitHub
- [ ] All files visible in repository
- [ ] `.env.local` is NOT in repository (should be ignored)
- [ ] `node_modules/` is NOT in repository
- [ ] README.md displays correctly

---

## 🚀 Vercel Deployment

### Account & Project Setup
- [ ] Vercel account created/logged in
- [ ] Connected GitHub account to Vercel
- [ ] Imported GitHub repository to Vercel
- [ ] Project name set correctly

### Build Configuration
- [ ] Framework preset: **Vite**
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`
- [ ] Root directory: `./`

### Environment Variables
- [ ] Added `GEMINI_API_KEY` in Vercel
- [ ] Applied to: Production ✓
- [ ] Applied to: Preview ✓
- [ ] Applied to: Development ✓

### First Deployment
- [ ] Clicked "Deploy" button
- [ ] Build completed successfully
- [ ] No build errors in logs
- [ ] Deployment shows "Ready"

---

## 🧪 Post-Deployment Testing

### Basic Functionality
- [ ] App loads at Vercel URL
- [ ] No 404 errors
- [ ] CSS styles loading correctly
- [ ] Fonts displaying properly
- [ ] Background colors/effects visible

### User Features
- [ ] Can register new account
- [ ] Can log in with account
- [ ] Dashboard displays correctly
- [ ] User stats show (Level, XP, Data Bits)

### Challenge System
- [ ] Can select challenge category
- [ ] Challenge generates successfully
- [ ] Can type and submit answers
- [ ] AI responds to messages
- [ ] Rewards awarded correctly
- [ ] XP increases after correct answer

### Voice Features
- [ ] Settings modal opens
- [ ] Can change language
- [ ] Can change voice gender
- [ ] Can toggle vocoder effect
- [ ] Can test voice (audio plays)
- [ ] Settings persist after refresh

### Audio Features
- [ ] TTS works in challenges
- [ ] Can play audio messages
- [ ] Audio icon shows when playing
- [ ] Live chat connects (microphone permission)
- [ ] AudioWorklet loads without errors

### Mobile Testing
- [ ] Responsive on phone (< 768px)
- [ ] Text readable on small screens
- [ ] Buttons are tappable
- [ ] Settings modal scrollable
- [ ] Challenge screen usable
- [ ] No horizontal scrolling

### Accessibility
- [ ] Can navigate with keyboard (Tab)
- [ ] Focus indicators visible
- [ ] Buttons have clear labels
- [ ] No missing alt text
- [ ] Color contrast sufficient

---

## 🐛 Troubleshooting Checklist

If deployment fails, check:

### Build Errors
- [ ] Check Vercel deployment logs
- [ ] Verify all dependencies in `package.json`
- [ ] Test build locally (`npm run build`)
- [ ] Check for TypeScript errors

### Runtime Errors
- [ ] Open browser console
- [ ] Check for API key errors
- [ ] Verify AudioWorklet file loading
- [ ] Check network requests

### Environment Issues
- [ ] `GEMINI_API_KEY` set in Vercel
- [ ] Redeploy after adding env vars
- [ ] Check env var name spelling
- [ ] Verify API key is valid

---

## 🔄 Continuous Deployment

### Future Updates
- [ ] Make changes locally
- [ ] Test changes (`npm run dev`)
- [ ] Commit changes (`git commit`)
- [ ] Push to GitHub (`git push`)
- [ ] Vercel auto-deploys ✓
- [ ] Check deployment status
- [ ] Test on production URL

### Branch Strategy
- [ ] Use branches for features
- [ ] Create pull requests
- [ ] Preview deployments work
- [ ] Merge to main after testing

---

## 📊 Monitoring

### Regular Checks
- [ ] Check Vercel Analytics weekly
- [ ] Monitor error logs
- [ ] Review API usage
- [ ] Test critical features monthly

### Performance
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Monitor load times
- [ ] Optimize if needed

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ App is live at Vercel URL  
✅ No console errors  
✅ All features work as locally  
✅ Mobile experience is smooth  
✅ Voice settings persist  
✅ Challenges generate correctly  
✅ Rewards are awarded  
✅ Audio features work  

---

## 📝 Next Steps After Deployment

1. **Share your app** - Send URL to friends/testers
2. **Custom domain** (optional) - Add in Vercel settings
3. **Monitor usage** - Check Vercel Analytics
4. **Gather feedback** - Create GitHub Discussions
5. **Plan improvements** - Use GitHub Issues for features
6. **Update README** - Add your live demo URL

---

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Blank page after deploy | Check console for errors, verify env vars |
| API calls fail | Add `GEMINI_API_KEY` to Vercel env vars |
| Audio not working | Check AudioWorklet path in `vercel.json` |
| Build fails | Check Vercel logs, test `npm run build` locally |
| 404 on refresh | Rewrites in `vercel.json` should handle this |

---

## ✨ You're Ready!

When all items are checked, your app is live and ready for users! 🎉

**Production URL**: `https://your-project.vercel.app`

Share it with the world! 🌍

