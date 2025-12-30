# Telegram Integration - Quick Start Guide

## 📋 Complete Setup Checklist

### ✅ Step 1: Create Telegram Bot & Channel (5 minutes)
1. Open Telegram → Search `@BotFather` → `/newbot` → Get **Bot Token**
2. Create a channel → Add bot as administrator → Get **Channel ID**
3. **Save both credentials!**

📖 **Full guide**: See `TELEGRAM_SETUP.md`

---

### ✅ Step 2: Deploy Serverless Function (10 minutes)

**Recommended: Vercel** (easiest)

1. Go to [vercel.com](https://vercel.com) → Sign up
2. Create new project → Upload your files
3. Create folder `api` → Copy `api/telegram.js` there
4. Go to **Settings** → **Environment Variables**:
   - Add `TELEGRAM_BOT_TOKEN` = your bot token
   - Add `TELEGRAM_CHANNEL_ID` = your channel ID
5. Deploy → Copy function URL (e.g., `https://your-project.vercel.app/api/telegram`)

📖 **Full guide**: See `SERVERLESS_SETUP.md`

---

### ✅ Step 3: Update Your Website (1 minute)

1. Open `script.js`
2. Find this line (around line 48):
   ```javascript
   const TELEGRAM_API_URL = 'https://your-serverless-function.vercel.app/api/telegram';
   ```
3. Replace with your actual function URL from Step 2
4. Save and deploy to GitHub Pages

---

### ✅ Step 4: Test It!

1. Open your website
2. Check your Telegram channel
3. You should see: "🎄 Նոր Տարի 2026 - Կայք բացված"

---

## 📊 Events That Will Be Tracked

| Event | When It Happens | What's Sent |
|-------|----------------|------------|
| **Page Load** | User opens website | IP address, screen size, browser, timestamp |
| **Quest Button Click** | User clicks "Բացիր" | Timestamp, IP |
| **Quest Step Completed** | User completes a quest step | Step number, name, progress |
| **All Quests Completed** | User finishes all 4 quests | Total time, all steps, timestamp |
| **Page Unload** | User leaves website | Total time spent, quest progress summary |

---

## 🔧 Files You Need

- ✅ `TELEGRAM_SETUP.md` - How to create bot & channel
- ✅ `SERVERLESS_SETUP.md` - How to deploy serverless function
- ✅ `api/telegram.js` - Vercel function (copy to your project)
- ✅ `netlify/functions/telegram.js` - Netlify function (alternative)
- ✅ `script.js` - Already updated with tracking code

---

## 🎯 Quick Reference

### Your Credentials:
- **Bot Token**: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz` (from BotFather)
- **Channel ID**: `-1001234567890` (from @userinfobot)

### Your Function URL:
- **Vercel**: `https://your-project.vercel.app/api/telegram`
- **Netlify**: `https://your-site.netlify.app/.netlify/functions/telegram`

### Update This in script.js:
```javascript
const TELEGRAM_API_URL = 'YOUR_FUNCTION_URL_HERE';
```

---

## 🆘 Need Help?

1. **Bot not working?** → Check `TELEGRAM_SETUP.md` Step 4
2. **Function not working?** → Check `SERVERLESS_SETUP.md` Troubleshooting
3. **Messages not appearing?** → Verify bot is admin in channel
4. **CORS errors?** → Check function URL is correct

---

## ✨ That's It!

Once you complete these 3 steps, your website will automatically send notifications to your Telegram channel for all the events listed above!

