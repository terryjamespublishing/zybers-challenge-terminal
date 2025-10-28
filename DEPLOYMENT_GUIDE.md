# 🚀 GitHub & Vercel Deployment Guide

Complete guide to deploying Zyber's Challenge Terminal to Vercel via GitHub.

---

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] Gemini API key (from [AI Studio](https://aistudio.google.com/app/apikey))
- [ ] Git installed locally

---

## 🔧 Step 1: Prepare Your Repository

### Check Git Status
```bash
cd /Users/terryjames/Documents/zyber\'s-challenge-terminal

# Check if git is already initialized
git status
```

### Initialize Git (if not already done)
```bash
# Initialize repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Zyber's Challenge Terminal with improvements"
```

---

## 📦 Step 2: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)
```bash
# Install GitHub CLI if needed
# macOS: brew install gh
# Login to GitHub
gh auth login

# Create repository
gh repo create zybers-challenge-terminal --public --source=. --remote=origin --push
```

### Option B: Using GitHub Website
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `zybers-challenge-terminal`
3. Description: "Educational AI tutor app with retro hacker theme"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README (we already have files)
6. Click "Create repository"

7. Link your local repo:
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/zybers-challenge-terminal.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 3: Deploy to Vercel

### Method 1: Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose your GitHub repository

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add: `GEMINI_API_KEY` = `your_api_key_here`
   - Apply to: Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? zybers-challenge-terminal
# - Directory? ./
# - Override settings? No

# Add environment variable
vercel env add GEMINI_API_KEY

# Deploy to production
vercel --prod
```

---

## ⚙️ Step 4: Configure Environment Variables

### In Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following:

| Name | Value | Environments |
|------|-------|--------------|
| `GEMINI_API_KEY` | Your API key | Production, Preview, Development |

4. **Important**: Redeploy after adding variables
   - Go to "Deployments"
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## 🔄 Step 5: Set Up Continuous Deployment

### Automatic Deployments
Vercel automatically deploys when you push to GitHub!

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically builds and deploys!
```

### Preview Deployments
Every pull request gets its own preview URL:
```bash
# Create a new branch
git checkout -b feature/new-challenge

# Make changes and push
git add .
git commit -m "Add math challenge category"
git push origin feature/new-challenge

# Create pull request on GitHub
# Vercel creates preview deployment automatically!
```

---

## 🐛 Troubleshooting

### Build Fails with "API_KEY not set"
**Solution**: Add `GEMINI_API_KEY` to Vercel environment variables

```bash
# Via CLI
vercel env add GEMINI_API_KEY
```

### AudioWorklet Not Loading
**Solution**: The `vercel.json` already handles this with proper headers

### Module Not Found Errors
**Solution**: Ensure all dependencies are in `package.json`
```bash
# Locally test build
npm run build

# If successful, commit and push
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### 404 on Refresh
**Solution**: The `vercel.json` includes rewrites for SPA routing

---

## 📊 Vercel Dashboard Features

### Analytics
- Go to "Analytics" tab
- See page views, performance metrics
- Monitor API usage

### Logs
- Go to "Deployments" → Select deployment → "Logs"
- View build logs and runtime errors

### Domains
- Go to "Settings" → "Domains"
- Add custom domain (e.g., `zyber.yourdomain.com`)
- Vercel handles SSL automatically

---

## 🔒 Security Best Practices

### 1. Environment Variables
✅ **DO**: Store API keys in Vercel environment variables  
❌ **DON'T**: Commit `.env.local` to GitHub

### 2. Branch Protection
```bash
# On GitHub:
# Settings → Branches → Add rule
# - Branch name pattern: main
# - Require pull request reviews
# - Require status checks to pass
```

### 3. API Key Rotation
- Regularly rotate your Gemini API key
- Update in Vercel environment variables
- Redeploy

---

## 📈 Monitoring Your App

### Check Deployment Status
```bash
# Via CLI
vercel ls

# Or visit
https://vercel.com/dashboard
```

### View Logs
```bash
vercel logs your-project-url
```

### Performance
- Vercel Analytics (built-in)
- Lighthouse scores
- Web Vitals monitoring

---

## 🎯 Post-Deployment Checklist

- [ ] App loads at Vercel URL
- [ ] Can create account and login
- [ ] Voice settings work and persist
- [ ] Challenges generate correctly
- [ ] Rewards are awarded properly
- [ ] Mobile view looks good
- [ ] Toast notifications appear
- [ ] Audio features work
- [ ] Settings modal opens/closes
- [ ] No console errors

---

## 🚀 Quick Commands Reference

```bash
# Local development
npm run dev

# Build locally
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs

# Add environment variable
vercel env add VARIABLE_NAME

# Pull environment variables
vercel env pull
```

---

## 🔗 Useful Links

- **Your Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/YOUR_USERNAME/zybers-challenge-terminal
- **Vercel Documentation**: https://vercel.com/docs
- **Vite Deployment Guide**: https://vitejs.dev/guide/static-deploy.html

---

## 🎉 You're Live!

Once deployed, your app will be available at:
- **Production**: `https://zybers-challenge-terminal.vercel.app`
- **Custom Domain**: Configure in Vercel settings

Share your app URL and start teaching! 📚

---

## 🆘 Need Help?

### Common Issues & Solutions

**Q: Build succeeds but app shows blank page?**  
A: Check browser console for errors, verify all files are committed

**Q: API calls failing in production?**  
A: Verify `GEMINI_API_KEY` is set in Vercel environment variables

**Q: App works locally but not on Vercel?**  
A: Check Vercel deployment logs, ensure all dependencies are in `package.json`

**Q: Want to rollback a deployment?**  
A: Go to Deployments → Find previous version → Promote to Production

---

## 📞 Support Resources

- **Vercel Support**: https://vercel.com/support
- **Vercel Discord**: https://vercel.com/discord
- **GitHub Discussions**: Enable in your repo settings
- **Documentation**: See other .md files in this project

---

Happy Deploying! 🚀

