#!/bin/bash

# 🚀 GitHub & Vercel Setup Script
# For Zyber's Challenge Terminal

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Zyber's Challenge Terminal - Deployment Setup        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}📦 Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✓ Git initialized${NC}"
else
    echo -e "${GREEN}✓ Git repository already exists${NC}"
fi

# Check for .env.local
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo -e "${BLUE}Creating from template...${NC}"
    cp .env.example .env.local
    echo -e "${RED}⚠️  IMPORTANT: Edit .env.local and add your GEMINI_API_KEY${NC}"
    echo ""
    read -p "Press Enter when you've added your API key..."
fi

# Check if dependencies are installed
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Test build
echo -e "${YELLOW}🔨 Testing build...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed. Fix errors before continuing.${NC}"
    exit 1
fi

# Check git status
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}📝 Uncommitted changes detected${NC}"
    echo ""
    echo "Files to commit:"
    git status --short
    echo ""
    read -p "Commit all changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Commit message: " commit_msg
        git commit -m "$commit_msg"
        echo -e "${GREEN}✓ Changes committed${NC}"
    fi
else
    echo -e "${GREEN}✓ All changes committed${NC}"
fi

# Check for GitHub remote
if ! git remote | grep -q origin; then
    echo ""
    echo -e "${YELLOW}🔗 Setting up GitHub remote...${NC}"
    echo ""
    echo "Choose setup method:"
    echo "  1) GitHub CLI (gh)"
    echo "  2) Manual (you'll create repo on GitHub)"
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        # Check if gh is installed
        if ! command -v gh &> /dev/null; then
            echo -e "${RED}✗ GitHub CLI not installed${NC}"
            echo "Install with: brew install gh"
            exit 1
        fi
        
        echo "Creating repository on GitHub..."
        gh repo create zybers-challenge-terminal --public --source=. --remote=origin
        echo -e "${GREEN}✓ GitHub repository created${NC}"
        
    elif [ "$choice" = "2" ]; then
        echo ""
        echo "Manual setup instructions:"
        echo "1. Go to: https://github.com/new"
        echo "2. Repository name: zybers-challenge-terminal"
        echo "3. Make it Public or Private"
        echo "4. DO NOT initialize with README"
        echo "5. Click 'Create repository'"
        echo ""
        read -p "Enter your GitHub username: " username
        read -p "Press Enter when repository is created..."
        
        git remote add origin "https://github.com/$username/zybers-challenge-terminal.git"
        echo -e "${GREEN}✓ Remote added${NC}"
    fi
else
    echo -e "${GREEN}✓ GitHub remote already configured${NC}"
fi

# Check if on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo -e "${YELLOW}📋 Renaming branch to 'main'...${NC}"
    git branch -M main
fi

# Push to GitHub
echo ""
read -p "Push to GitHub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⬆️  Pushing to GitHub...${NC}"
    git push -u origin main
    echo -e "${GREEN}✓ Pushed to GitHub${NC}"
fi

# Vercel setup
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Vercel Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo "Choose deployment method:"
echo "  1) Vercel Dashboard (Recommended for first time)"
echo "  2) Vercel CLI"
echo "  3) Skip for now"
read -p "Enter choice (1, 2, or 3): " vercel_choice

if [ "$vercel_choice" = "1" ]; then
    echo ""
    echo "Opening Vercel dashboard..."
    echo ""
    echo "Steps to follow:"
    echo "1. Sign in to Vercel"
    echo "2. Click 'Add New' → 'Project'"
    echo "3. Import your GitHub repository"
    echo "4. Framework: Vite"
    echo "5. Add environment variable: GEMINI_API_KEY"
    echo "6. Click 'Deploy'"
    echo ""
    open "https://vercel.com/new" 2>/dev/null || xdg-open "https://vercel.com/new" 2>/dev/null || echo "Visit: https://vercel.com/new"
    
elif [ "$vercel_choice" = "2" ]; then
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}Installing Vercel CLI...${NC}"
        npm i -g vercel
    fi
    
    echo -e "${YELLOW}Deploying to Vercel...${NC}"
    vercel
    
    echo ""
    echo -e "${YELLOW}⚠️  Don't forget to add GEMINI_API_KEY in Vercel dashboard!${NC}"
    echo "Run: vercel env add GEMINI_API_KEY"
    
else
    echo "Skipping Vercel deployment"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Setup Complete!                                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "  📚 Read: DEPLOYMENT_GUIDE.md"
echo "  ✅ Check: DEPLOYMENT_CHECKLIST.md"
echo "  🌐 Visit your GitHub repo"
echo "  🚀 Deploy to Vercel if you haven't already"
echo ""
echo "Your repository: $(git remote get-url origin 2>/dev/null || echo 'Not set')"
echo ""
echo -e "${BLUE}Happy deploying! 🎉${NC}"

