# Telegram Bot Setup Guide

## 📱 Step 1: Create Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a chat with BotFather
3. Send command: `/newbot`
4. Follow the prompts:
   - Choose a name for your bot (e.g., "New Year Quest Bot")
   - Choose a username (must end with "bot", e.g., "newyearquest_bot")
5. **Save the Bot Token** - BotFather will give you a token like:
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
   ⚠️ **KEEP THIS SECRET!** Don't share it publicly.

---

## 📢 Step 2: Create Telegram Channel

1. Open Telegram
2. Click the menu (☰) → **"New Channel"**
3. Choose a name (e.g., "New Year Quest Notifications")
4. Choose if it's Public or Private
5. Add a description (optional)
6. Click **"Create"**

---

## 🔗 Step 3: Add Bot to Channel

1. Open your channel
2. Click channel name (top) → **"Administrators"**
3. Click **"Add Administrator"**
4. Search for your bot (the username you created, e.g., `@newyearquest_bot`)
5. Select it and give it **"Post Messages"** permission
6. Click **"Done"**

---

## 🆔 Step 4: Get Channel ID

### Method 1: Using @userinfobot
1. Search for **@userinfobot** in Telegram
2. Start a chat and send `/start`
3. Forward any message from your channel to @userinfobot
4. It will show you the Channel ID (looks like `-1001234567890`)

### Method 2: Using @getidsbot
1. Search for **@getidsbot** in Telegram
2. Add it to your channel as administrator
3. Send any message in the channel
4. The bot will reply with the Channel ID

### Method 3: Using Web Browser
1. Open: `https://web.telegram.org`
2. Go to your channel
3. Look at the URL - it will contain the channel ID

**Note:** Channel IDs for groups/channels usually start with `-100` (e.g., `-1001234567890`)

---

## 🔐 Step 5: Save Your Credentials

You need these two things:
- **Bot Token**: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
- **Channel ID**: `-1001234567890`

Save them securely - you'll need them for the serverless function.

---

## 🚀 Step 6: Deploy Serverless Function

Since GitHub Pages is static (no backend), you need a serverless function to send messages securely.

### Option A: Vercel (Recommended - Free & Easy)

1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Create a new project
3. Create a folder `api` in your project
4. Create file `api/telegram.js` (see example below)
5. Add environment variables in Vercel:
   - `TELEGRAM_BOT_TOKEN` = your bot token
   - `TELEGRAM_CHANNEL_ID` = your channel ID
6. Deploy
7. Copy the function URL (e.g., `https://your-project.vercel.app/api/telegram`)

### Option B: Netlify Functions

1. Go to [netlify.com](https://netlify.com) and sign up
2. Create a new site
3. Create folder `netlify/functions`
4. Create file `netlify/functions/telegram.js`
5. Add environment variables in Netlify dashboard
6. Deploy
7. Copy the function URL

### Option C: Cloudflare Workers

1. Go to [workers.cloudflare.com](https://workers.cloudflare.com)
2. Create a new Worker
3. Add environment variables
4. Deploy
5. Copy the Worker URL

---

## 📝 Step 7: Update Your Website

1. Open `script.js`
2. Find the `TELEGRAM_API_URL` constant
3. Replace with your serverless function URL
4. Deploy to GitHub Pages

---

## ✅ Testing

1. Open your website
2. Check your Telegram channel
3. You should see a message when the page loads

---

## 🔒 Security Notes

- **Never** put your Bot Token directly in `script.js` (it will be visible to everyone)
- Always use a serverless function to hide your token
- The serverless function acts as a secure middleman

---

## 📊 Events That Will Be Tracked

1. **Page Load**: When someone opens the site (includes IP address)
2. **Quest Button Click**: When user clicks "Բացիր" button
3. **Quest Step Completed**: Each time a quest step is finished
4. **All Quests Completed**: When user finishes all 4 quests
5. **Time Tracking**: How long user stays on the site

---

## 🆘 Troubleshooting

### Bot not sending messages?
- Check bot is added to channel as administrator
- Verify bot has "Post Messages" permission
- Check Channel ID is correct (must include `-100` prefix)

### Serverless function not working?
- Check environment variables are set correctly
- Verify function URL is correct
- Check function logs for errors

### Messages not appearing?
- Check browser console for errors
- Verify CORS is enabled in serverless function
- Test function URL directly with a tool like Postman

