# ASM Nextgen Grievance Redressal - Deployment Guide

## 🚀 Quick Start (Local Development)

The app is now configured to run **completely offline** without any API keys!

### Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

**Default Login Credentials:**
- Admin: `admin@asmedu.org` / `asm@123`
- Faculty: `amrita.s@asmedu.org` / `asm@123`

All data is stored in browser localStorage - no database needed!

---

## 📦 Deploy to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite settings
5. Click "Deploy"

Your app is now live! (Still using localStorage)

---

## 🔥 Enable Firebase (Optional)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (e.g., "asm-grievance")
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create Database"
   - Choose "Start in test mode"
   - Select your region

### Step 2: Get Firebase Config

1. Go to Project Settings > General
2. Scroll to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Copy the firebaseConfig values

### Step 3: Add to Vercel Environment Variables

In Vercel Dashboard > Your Project > Settings > Environment Variables, add:

```
VITE_USE_FIREBASE=true
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Redeploy your app - Firebase is now active!

---

## 🤖 Enable Gemini AI (Optional)

### Get API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key

### Add to Vercel

Add environment variable:
```
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Redeploy - AI analysis is now enabled!

---

## 🔧 Local Development with Firebase/Gemini

Update `.env.local`:

```env
VITE_USE_FIREBASE=true
VITE_GEMINI_API_KEY=your_key_here
VITE_FIREBASE_API_KEY=your_firebase_key
# ... add other Firebase config
```

---

## 📊 Features

### Works Offline (Default)
- ✅ Full grievance management
- ✅ User management
- ✅ Dashboard analytics
- ✅ Mock AI analysis
- ✅ Browser localStorage

### With Firebase
- ✅ Real-time sync across devices
- ✅ Cloud data persistence
- ✅ Multi-user collaboration

### With Gemini AI
- ✅ Smart grievance categorization
- ✅ Sentiment analysis
- ✅ Auto-generated responses
- ✅ Priority detection

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Database:** Firebase Firestore (optional)
- **AI:** Google Gemini (optional)
- **Hosting:** Vercel
- **Charts:** Recharts

---

## 📝 Project Structure

```
├── components/          # React components
├── services/           
│   ├── firebase.ts     # Firebase config (optional)
│   ├── geminiService.ts # AI service (optional)
│   └── emailService.ts # Email notifications
├── types.ts            # TypeScript types
├── App.tsx             # Main app component
├── .env.local          # Local environment variables
└── vercel.json         # Vercel deployment config
```

---

## 🎯 Roadmap

- [ ] Email notifications via EmailJS
- [ ] File attachments for grievances
- [ ] Export reports to PDF
- [ ] Mobile app (React Native)
- [ ] SMS notifications

---

## 📞 Support

For issues or questions, contact: admin@asmedu.org
