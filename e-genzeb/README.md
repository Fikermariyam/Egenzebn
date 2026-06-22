# e-ገንዘብ (e-Genzeb) — Deployment Guide

## What's in this folder

```
e-genzeb/
├── index.html          ← Main HTML file
├── package.json        ← Dependencies (React + Vite)
├── vite.config.js      ← Build config
├── public/
│   ├── manifest.json   ← PWA config (makes it installable on phones)
│   ├── sw.js           ← Service worker (offline support)
│   ├── icon-192.png    ← App icon (small)
│   └── icon-512.png    ← App icon (large)
└── src/
    ├── main.jsx        ← Entry point
    └── App.jsx         ← The entire e-ገንዘብ app
```

---

## OPTION A: Deploy to Vercel (Recommended — 5 minutes)

### Step 1: Create a GitHub account (if you don't have one)
- Go to https://github.com → Sign up

### Step 2: Create a new repository
- Click the green **"New"** button
- Name it `e-genzeb`
- Leave it **Public**
- Click **"Create repository"**

### Step 3: Upload this folder
- On the repo page, click **"uploading an existing file"**
- Drag ALL the files from this folder into the browser
- Keep the folder structure! Upload: `index.html`, `package.json`, `vite.config.js`, the `public/` folder, and the `src/` folder
- Click **"Commit changes"**

### Step 4: Deploy on Vercel
- Go to https://vercel.com → Sign up with GitHub
- Click **"Add New Project"**
- Select your `e-genzeb` repo
- Vercel auto-detects it's a Vite project
- Click **"Deploy"**
- Wait 1-2 minutes
- Done! You get a URL like: `e-genzeb.vercel.app`

### Step 5: Share it
- Send the URL to anyone — it works on any phone browser
- On iPhone: Open in Safari → tap Share → "Add to Home Screen" → it appears as a real app
- On Android: Chrome will prompt "Add to Home Screen" automatically

---

## OPTION B: Run locally on your computer first

### Step 1: Install Node.js
- Go to https://nodejs.org → Download LTS version → Install

### Step 2: Open Terminal (Mac) or Command Prompt (Windows)
```bash
cd path/to/e-genzeb
npm install
npm run dev
```

### Step 3: Open in browser
- It will show: `Local: http://localhost:5173`
- Open that link in your browser
- To test mobile: open it on your phone using your computer's IP address

---

## OPTION C: Deploy to Netlify (Alternative)

- Go to https://app.netlify.com
- Drag the entire `e-genzeb` folder onto the page
- Note: You need to build first locally (`npm run build`) then drag the `dist/` folder

---

## Custom domain (optional)
Once deployed on Vercel, go to Project Settings → Domains → Add `egenzeb.com` or whatever domain you purchase.

---

## What people will see
- A full fintech app with Send, Save, Book, Call, Shop
- Amharic/English toggle
- Ethiopian calendar, ETB currency
- Remittance calculator (CAD → ETB)
- KYC verification flow
- Works offline on phones
- Installs like a native app from the browser
