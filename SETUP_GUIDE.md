# ResumeATS Pro — Complete Setup & Deployment Guide
> Written for vibe coders. Follow step by step. You got this 🚀

---

## 📁 FILE STRUCTURE

```
ats-website/
├── index.html        ← The entire frontend (landing page + tool)
├── server.js         ← The backend (Node.js/Express)
├── package.json      ← Project dependencies list
├── .env.example      ← Template for your secret keys
├── .gitignore        ← Files to NOT upload to GitHub
└── SETUP_GUIDE.md    ← This file
```

---

## STEP 1 — Install Node.js

If you don't have Node.js installed:
1. Go to https://nodejs.org
2. Download the "LTS" version (the green button)
3. Install it (just click Next → Next → Finish)
4. Open a terminal/command prompt and type: `node --version`
5. If it shows a version number (like v20.x.x), you're good

---

## STEP 2 — Get Your Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click "API Keys" in the left menu
4. Click "Create Key" → copy the key (looks like: sk-ant-xxxx...)
5. Save it somewhere safe — you'll use it in Step 4

> 💡 You get $5 free credits when you sign up. Each resume analysis costs ~₹0.05–0.15

---

## STEP 3 — Set Up the Project

Open your terminal/command prompt:

```bash
# 1. Go to the project folder
cd path/to/ats-website

# 2. Install all dependencies (this downloads express, cors, etc.)
npm install

# This creates a node_modules/ folder — takes about 30 seconds
```

---

## STEP 4 — Add Your API Key

```bash
# Copy the example file to create your real .env file
cp .env.example .env
```

Now open the `.env` file in any text editor (Notepad, VS Code, etc.)
and replace `sk-ant-your-key-here` with your actual key:

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxx-your-real-key-here
PORT=3000
ALLOWED_ORIGIN=*
```

Save the file. ⚠️ Never share this file or upload it to GitHub.

---

## STEP 5 — Run It Locally (Test It)

```bash
# Start the server
npm start

# You should see:
# ✅  ResumeATS Pro server running at http://localhost:3000
```

Open your browser and go to: **http://localhost:3000**

Your website is now running locally! Test it by:
1. Pasting a resume in the text box
2. Clicking "Analyze My Resume"
3. See the ATS score appear 🎉

To stop the server: press Ctrl+C in the terminal

---

## STEP 6 — Deploy Online (Free Options)

### Option A: Railway (EASIEST — Recommended)
Railway is the simplest way to deploy a Node.js server for free.

1. Go to https://railway.app and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Upload your project to GitHub first (see below), then connect it
4. In Railway dashboard, go to "Variables" tab
5. Add your environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your actual API key
6. Click Deploy — Railway gives you a free URL like `resumeats.up.railway.app`

**Upload to GitHub first:**
```bash
git init
git add .
git commit -m "Initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/ats-website.git
git push -u origin main
```

### Option B: Render (Also Free)
1. Go to https://render.com — sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add Environment Variable: `ANTHROPIC_API_KEY = your-key`
6. Click "Create Web Service"
7. Free URL: `your-app.onrender.com`
   (Note: free Render apps sleep after 15 min of inactivity)

### Option C: VPS (Best for Production)
If you want full control, buy a cheap VPS (₹300–500/month):
- Hostinger VPS
- DigitalOcean Droplet
- Hetzner

Then SSH in and run:
```bash
npm install
npm install -g pm2        # process manager (keeps app alive)
pm2 start server.js       # start with PM2
pm2 save                  # save so it restarts on reboot
```

---

## STEP 7 — Get a Custom Domain

1. Buy a domain at Namecheap (cheap: ~₹800/year)
   - Good names: resumeatspro.com, atsresumechecker.in, checkmyresume.co
2. In your hosting dashboard, point the domain to your deployed app
3. Railway and Render both support custom domains in their dashboard

---

## STEP 8 — Make Money 💰

### Option A: Google AdSense
1. Go to https://adsense.google.com
2. Sign up and add your website
3. Once approved (1–2 weeks), paste their ad code in index.html
4. Earn money per 1000 visitors (typically ₹50–200 per 1000 views)

Where to add ads in index.html:
- After the hero section (high visibility)
- Between the features and pricing section
- In the sidebar of the results

### Option B: Razorpay Subscription (for Pro plan)
1. Sign up at https://razorpay.com
2. Create a "Subscription Plan" (₹299/month)
3. Copy their payment button code and add it to the pricing section's "Upgrade to Pro" button
4. In the backend, check if user has paid before allowing unlimited API calls

### Option C: Affiliate Links
Add these to your blog/footer:
- LinkedIn Premium affiliate: linkedin.com/affiliate
- Naukri.com affiliate program
- Resume writing services

---

## COMMON ERRORS & FIXES

| Error | Fix |
|-------|-----|
| `Cannot find module 'express'` | Run `npm install` again |
| `ANTHROPIC_API_KEY is not set` | Check your .env file is saved correctly |
| `Port 3000 already in use` | Change PORT=3001 in .env |
| `fetch is not defined` | Upgrade Node.js to v18+ |
| Website shows but "Something went wrong" | Check your API key is valid in console.anthropic.com |
| Blank page on Railway/Render | Check the deploy logs for errors |

---

## HOW THE CODE WORKS (Simple Explanation)

```
User opens website (index.html)
         ↓
User pastes resume + clicks Analyze
         ↓
index.html sends request to /api/analyze
         ↓
server.js receives it, builds a prompt
         ↓
server.js calls Anthropic API with the prompt
(API key is on server — users never see it)
         ↓
Claude AI analyzes the resume
         ↓
Returns JSON with score, keywords, suggestions
         ↓
server.js sends JSON back to index.html
         ↓
index.html renders the beautiful results ✨
```

The reason we have a backend (server.js) is to HIDE your API key.
If you put the API key directly in index.html, anyone could steal it
and use your credits. The backend keeps it secret.

---

## QUICK CUSTOMIZATION GUIDE

### Change the website name/branding
Search in index.html for "ResumeATS Pro" and replace with your brand name.

### Change the pricing
Find the `#pricing` section in index.html and update the numbers.

### Change the color scheme
At the top of index.html, find `:root { ... }` and change:
- `--blue: #1d6bdc` → your brand color
- `--gold: #f59e0b` → your accent color

### Add Google Analytics
Paste your GA4 code just before `</head>` in index.html.

### Change the rate limit
In server.js, find `max: 10` and change it.
(10 = 10 free checks per IP per hour)

---

## TECH STACK SUMMARY

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | HTML + CSS + Vanilla JS | Fast, no build step needed |
| Backend | Node.js + Express | Simple, fast, free to host |
| AI | Anthropic Claude API | Best-in-class analysis |
| Security | Helmet + CORS + Rate Limiting | Production-ready |
| Hosting | Railway / Render | Free tier available |
| Domain | Namecheap | Cheap, reliable |

---

Good luck! 🚀 If you get stuck, the errors are almost always:
1. API key not set correctly in .env
2. `npm install` not run
3. Node.js version too old (needs v18+)
