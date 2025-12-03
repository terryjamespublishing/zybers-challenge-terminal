# 🔑 Google Gemini API Key Setup

## 🚨 **YOU NEED TO ADD YOUR API KEY!**

The app won't work without a valid Google Gemini API key. Here's how to set it up:

---

## 📝 **Step-by-Step Setup**

### **Step 1: Get Your Free API Key**

1. Go to: **https://aistudio.google.com/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Click **"Create API key in new project"** (or select existing project)
5. **Copy the API key** (looks like: `AIzaSyD...`)

**⚠️ Important:** Keep this key secret! Don't share it publicly.

---

### **Step 2: Add Key to .env.local**

1. Open the file: `.env.local` in your project root
2. Find this line:
```
VITE_GEMINI_API_KEY=PLACEHOLDER_API_KEY
```

3. Replace `PLACEHOLDER_API_KEY` with your actual API key:
```
VITE_GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz
```

4. **Save the file**

---

### **Step 3: Restart Dev Server**

The server needs to restart to load the new environment variable:

```bash
# Press Ctrl+C to stop the server
# Then restart it:
npm run dev
```

---

### **Step 4: Verify It Works**

1. **Refresh browser**: `Cmd+R` or `Ctrl+R`
2. **Open Console**: Press `F12`
3. **Look for**: `✅ Gemini API Key loaded successfully`

If you see that message, you're good to go! ✅

If you see `❌ GEMINI API KEY NOT SET!`, check your `.env.local` file.

---

## 🧪 **Test the Voice**

1. **Start a challenge** or go to **Settings**
2. Click **[TEST_VOICE]**
3. You should hear Zyber's voice!

---

## 🐛 **Troubleshooting**

### **Error: "API_KEY not configured"**

**Problem**: The API key isn't loading

**Solutions:**
1. Make sure the file is named **`.env.local`** (with the dot)
2. Make sure it's in the **project root** (same folder as `package.json`)
3. Use **`VITE_GEMINI_API_KEY`** (with the VITE_ prefix)
4. **Restart the dev server** after changing `.env.local`
5. **Hard refresh browser**: `Cmd+Shift+R` or `Ctrl+Shift+R`

### **Error: "Failed to test voice"**

**Problem**: API call is failing

**Check:**
1. ✅ API key is correct (no typos)
2. ✅ Internet connection is working
3. ✅ You're within the free tier limits (see below)
4. ✅ Browser console for specific error messages

### **Error: "Rate limit exceeded"**

**Problem**: Too many requests to the API

**Solution:**
- Wait a few minutes
- The free tier has limits on requests per minute
- Consider upgrading if you need more

---

## 💰 **API Pricing (Free Tier)**

Google Gemini offers a **generous free tier**:

- ✅ **15 requests per minute**
- ✅ **1,500 requests per day**
- ✅ **Free for testing and development**

For a classroom setting with kids, this should be plenty!

**Cost if you exceed free tier:**
- Very affordable (fractions of a cent per request)
- You'd need thousands of requests to cost $1

---

## 🔒 **Security Best Practices**

### **DO:**
- ✅ Keep your API key in `.env.local`
- ✅ Never commit `.env.local` to GitHub (already in `.gitignore`)
- ✅ Regenerate key if accidentally exposed
- ✅ Use different keys for development and production

### **DON'T:**
- ❌ Put the key directly in code files
- ❌ Share your key publicly
- ❌ Commit `.env.local` to version control
- ❌ Use the same key for multiple projects

---

## 📂 **File Location**

Your `.env.local` should be in the project root:

```
zyber's-challenge-terminal/
  ├── .env.local          ← HERE! (with your API key)
  ├── package.json
  ├── index.html
  ├── vite.config.ts
  └── ...
```

---

## 📝 **Complete .env.local Example**

```bash
# Google Gemini API Key
# Get yours at: https://aistudio.google.com/apikey
VITE_GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz

# Note: Replace the value above with your actual API key
# Keep this file SECRET - never commit to GitHub!
```

---

## 🚀 **Quick Checklist**

Before the voice features will work:

- [ ] Get API key from https://aistudio.google.com/apikey
- [ ] Add key to `.env.local` as `VITE_GEMINI_API_KEY=...`
- [ ] Save the file
- [ ] Restart dev server (`Ctrl+C` then `npm run dev`)
- [ ] Refresh browser (`Cmd+R` or `Ctrl+R`)
- [ ] Check console for `✅ Gemini API Key loaded successfully`
- [ ] Test voice in Settings

---

## 💡 **Why Do I Need This?**

The app uses **Google Gemini AI** for:
1. **Voice synthesis** (text-to-speech)
2. **Challenge generation** (AI creates questions)
3. **Chat responses** (AI plays the character Zyber)
4. **Live voice chat** (real-time conversation)

Without an API key, none of these features will work.

**But it's FREE for personal/educational use!** 🎉

---

## 🆘 **Still Having Issues?**

1. **Check the browser console** (F12) for error messages
2. **Restart everything**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   # Refresh browser (Cmd+Shift+R)
   ```
3. **Verify your .env.local**:
   ```bash
   cat .env.local
   # Should show: VITE_GEMINI_API_KEY=AIza...
   ```
4. **Test the key works**:
   - Go to https://aistudio.google.com
   - Try the API key in their playground
   - If it works there, it should work in the app

---

## ✨ **Summary**

1. 🔑 **Get key**: https://aistudio.google.com/apikey
2. 📝 **Add to `.env.local`**: `VITE_GEMINI_API_KEY=YourKeyHere`
3. 🔄 **Restart server**: `npm run dev`
4. ✅ **Test it**: Click [TEST_VOICE] in Settings

**Once set up, you'll have full access to Zyber's synthetic voice!** 🤖🎤







