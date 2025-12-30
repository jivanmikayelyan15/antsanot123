# Serverless Function Setup Guide

This guide shows you how to deploy the Telegram notification function to different platforms.

## 🚀 Option 1: Vercel (Recommended - Easiest)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)

### Step 2: Create Project
1. Click **"Add New"** → **"Project"**
2. Import your GitHub repository (or upload files)
3. Vercel will auto-detect it's a static site

### Step 3: Add Serverless Function
1. In your project, create folder: `api`
2. Copy `api/telegram.js` to your project
3. The function will be available at: `https://your-project.vercel.app/api/telegram`

### Step 4: Add Environment Variables
1. Go to your project on Vercel
2. Click **Settings** → **Environment Variables**
3. Add these two variables:
   - **Name**: `TELEGRAM_BOT_TOKEN`
     **Value**: Your bot token (from BotFather)
   - **Name**: `TELEGRAM_CHANNEL_ID`
     **Value**: Your channel ID (e.g., `-1001234567890`)

### Step 5: Deploy
1. Push changes to GitHub (or upload files)
2. Vercel will automatically deploy
3. Copy the function URL: `https://your-project.vercel.app/api/telegram`

### Step 6: Update script.js
1. Open `script.js`
2. Find: `const TELEGRAM_API_URL = '...'`
3. Replace with your Vercel function URL:
   ```javascript
   const TELEGRAM_API_URL = 'https://your-project.vercel.app/api/telegram';
   ```

---

## 🌐 Option 2: Netlify Functions

### Step 1: Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up (free)

### Step 2: Create Site
1. Click **"Add new site"** → **"Import an existing project"**
2. Connect your GitHub repository

### Step 3: Add Serverless Function
1. Create folder: `netlify/functions`
2. Copy `netlify/functions/telegram.js` to your project
3. The function will be available at: `https://your-site.netlify.app/.netlify/functions/telegram`

### Step 4: Add Environment Variables
1. Go to **Site settings** → **Environment variables**
2. Add:
   - `TELEGRAM_BOT_TOKEN` = your bot token
   - `TELEGRAM_CHANNEL_ID` = your channel ID

### Step 5: Deploy
1. Push to GitHub
2. Netlify will auto-deploy
3. Copy function URL: `https://your-site.netlify.app/.netlify/functions/telegram`

### Step 6: Update script.js
```javascript
const TELEGRAM_API_URL = 'https://your-site.netlify.app/.netlify/functions/telegram';
```

---

## ⚡ Option 3: Cloudflare Workers

### Step 1: Create Cloudflare Account
1. Go to [workers.cloudflare.com](https://workers.cloudflare.com)
2. Sign up (free)

### Step 2: Create Worker
1. Click **"Create a Worker"**
2. Name it (e.g., `telegram-notifications`)

### Step 3: Add Code
Replace the default code with:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const BOT_TOKEN = TELEGRAM_BOT_TOKEN; // Set as secret
  const CHANNEL_ID = TELEGRAM_CHANNEL_ID; // Set as secret

  try {
    const { message } = await request.json();

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text: message,
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

### Step 4: Add Secrets
1. Go to **Settings** → **Variables**
2. Add secrets:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHANNEL_ID`

### Step 5: Deploy
1. Click **"Save and Deploy"**
2. Copy Worker URL: `https://telegram-notifications.your-subdomain.workers.dev`

### Step 6: Update script.js
```javascript
const TELEGRAM_API_URL = 'https://telegram-notifications.your-subdomain.workers.dev';
```

---

## ✅ Testing Your Function

### Test with curl:
```bash
curl -X POST https://your-function-url/api/telegram \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message"}'
```

### Test from Browser Console:
```javascript
fetch('https://your-function-url/api/telegram', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Test message' })
})
.then(r => r.json())
.then(console.log);
```

---

## 🔒 Security Notes

- **Never** put your Bot Token in `script.js` (it will be visible to everyone)
- Always use environment variables/secrets
- The serverless function acts as a secure middleman
- Only your serverless function knows the bot token

---

## 📊 What Gets Tracked

1. **Page Load**: IP address, screen size, browser, timestamp
2. **Quest Button Click**: When user clicks "Բացիր"
3. **Quest Step Completed**: Each quest step completion with progress
4. **All Quests Completed**: Total time taken, all steps completed
5. **Page Unload**: Total time spent on site, quest progress summary

---

## 🆘 Troubleshooting

### Function returns 500 error?
- Check environment variables are set correctly
- Verify bot token and channel ID are correct
- Check function logs for errors

### Messages not appearing in Telegram?
- Verify bot is added to channel as administrator
- Check bot has "Post Messages" permission
- Verify channel ID is correct (must include `-100` prefix)

### CORS errors?
- Make sure your function allows CORS (see Netlify example)
- Check function URL is correct in `script.js`

---

## 💡 Recommended: Vercel

**Why Vercel?**
- ✅ Easiest setup
- ✅ Free tier is generous
- ✅ Auto-deploys from GitHub
- ✅ Great documentation
- ✅ Fast global CDN

