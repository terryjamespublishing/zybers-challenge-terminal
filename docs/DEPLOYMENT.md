# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- GitHub account
- Vercel account ([vercel.com](https://vercel.com))
- Gemini API key ([aistudio.google.com/apikey](https://aistudio.google.com/apikey))

## Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your API key to .env.local
# VITE_GEMINI_API_KEY=your_key_here

# Start development server
npm run dev
```

App runs at `http://localhost:5173`

## Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select "Import Git Repository"
   - Choose your GitHub repository

2. **Configure Build**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   ```

3. **Add Environment Variables**
   - Name: `VITE_GEMINI_API_KEY`
   - Value: Your Gemini API key
   - Apply to: All environments

4. **Deploy** - Click "Deploy" and wait 1-2 minutes

### Method 2: Vercel CLI

```bash
# Install and login
npm i -g vercel
vercel login

# Deploy
vercel

# Add environment variable
vercel env add VITE_GEMINI_API_KEY

# Deploy to production
vercel --prod
```

## Continuous Deployment

Vercel automatically deploys on git push:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel deploys automatically!
```

## API Key Setup

1. Visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and add to:
   - Local: `.env.local`
   - Vercel: Environment Variables in dashboard

**Important**: Never commit `.env.local` to git!

## Post-Deployment Checklist

- [ ] App loads at Vercel URL
- [ ] Boot screen animation plays
- [ ] Intro riddle works
- [ ] Can create account and login
- [ ] Challenges generate correctly
- [ ] Voice/TTS works
- [ ] Settings persist after reload
- [ ] Mobile view works
- [ ] Admin panel accessible (`?admin=true`)

## Troubleshooting

### Build Fails
```bash
# Test build locally first
npm run build
```

### API Key Issues
- Verify `VITE_GEMINI_API_KEY` is set in Vercel
- Redeploy after adding environment variables

### 404 on Refresh
- `vercel.json` should handle SPA routing automatically

### AudioWorklet Not Loading
- Public files are served from `/public` directory
- Check network tab for 404 errors

## Quick Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
vercel --prod    # Deploy to production
vercel ls        # List deployments
vercel logs      # View deployment logs
```

## Custom Domain

1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL handled automatically
