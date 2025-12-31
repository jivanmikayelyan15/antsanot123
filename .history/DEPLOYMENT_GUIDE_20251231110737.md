# GitHub Pages Deployment Guide

## 📋 Quick Deployment Steps

### Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon (top right) → **"New repository"**
3. Repository name: `NewYearTemplate` (or any name you want)
4. Choose **Public** (required for free GitHub Pages)
5. **Don't** check "Initialize with README"
6. Click **"Create repository"**

### Step 2: Upload Files to GitHub

#### Option A: Using GitHub Website (Easiest)
1. In your new repository, click **"uploading an existing file"**
2. Drag and drop these files:
   - `index.html`
   - `script.js`
   - `style.css`
   - `video.mp4`
   - `video_mobile.mp4`
3. Scroll down, add commit message: `"Initial commit"`
4. Click **"Commit changes"**

#### Option B: Using Git Command Line
```bash
cd /Users/jivanmikayelyan/Projects/NewYearTemplate
git init
git add .
git commit -m "Initial commit - New Year 2026 template"
git remote add origin https://github.com/YOUR_USERNAME/NewYearTemplate.git
git branch -M main
git push -u origin main
```
*(Replace `YOUR_USERNAME` with your actual GitHub username)*

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **"Source"**:
   - Select **"Deploy from a branch"**
   - Branch: **`main`** (or `master`)
   - Folder: **`/ (root)`**
5. Click **"Save"**
6. Wait 1-2 minutes
7. Your site will be live at: `https://YOUR_USERNAME.github.io/NewYearTemplate/`


## 🌐 Adding Custom Domain (e.g., asd.com)

### Prerequisites
- You must own a domain (bought from Namecheap, GoDaddy, Google Domains, etc.)
- Your GitHub Pages site must already be deployed and working

### Step 1: Configure DNS Records

Go to your domain registrar's DNS settings (where you bought the domain):

#### For Apex Domain (asd.com):
Add **4 A records**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |

*(Note: "@" means root domain, some registrars use blank or "asd.com")*

#### For WWW Subdomain (www.asd.com):
Add **1 CNAME record**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | YOUR_USERNAME.github.io | 3600 |

*(Replace `YOUR_USERNAME` with your GitHub username)*

### Step 2: Add Domain in GitHub
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **"Custom domain"**, enter your domain:
   - For apex: `asd.com`
   - For www: `www.asd.com`
4. Check **"Enforce HTTPS"** (recommended)
5. Click **"Save"**

### Step 3: Wait for DNS Propagation
- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually takes **15-30 minutes**
- You can check status at: https://dnschecker.org

### Step 4: Verify It Works
1. Visit your custom domain: `https://asd.com`
2. Check GitHub Pages settings - it should show "DNS check successful"
3. If you see a certificate error, wait a bit longer (GitHub needs to issue SSL certificate)

---

## 🔍 How to Check Your Site

### Default GitHub Pages URL:
```
https://YOUR_USERNAME.github.io/NewYearTemplate/
```

### With Custom Domain:
```
https://asd.com
```
or
```
https://www.asd.com
```

---

## ⚠️ Important Notes

1. **Video File Size**: GitHub has a 100MB limit per file. If your videos are larger:
   - Compress them using tools like HandBrake
   - Or host videos on a CDN (Cloudinary, Vimeo) and update video sources

2. **HTTPS**: GitHub Pages automatically provides HTTPS (required for video autoplay with sound)

3. **DNS Propagation**: After adding DNS records, wait 15-30 minutes before testing

4. **IP Addresses**: GitHub's IP addresses are:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
   
   *(Always check GitHub's official docs for latest IPs: https://docs.github.com/en/pages/configuring-a-custom-domain)*

---

## 🐛 Troubleshooting

### Site not loading?
- Wait 2-3 minutes after enabling Pages
- Clear browser cache
- Check repository is Public

### Custom domain not working?
- Wait 15-30 minutes for DNS propagation
- Verify DNS records are correct using: https://dnschecker.org
- Check GitHub Pages settings show "DNS check successful"
- Make sure domain is entered correctly in GitHub Settings → Pages

### Videos not playing?
- Check file sizes are under 100MB
- Verify video paths in `index.html` are correct
- Test in different browsers

---

## 📚 Useful Links

- GitHub Pages Docs: https://docs.github.com/en/pages
- Custom Domain Docs: https://docs.github.com/en/pages/configuring-a-custom-domain
- DNS Checker: https://dnschecker.org

