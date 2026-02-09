# ASM Nextgen Grievance Redressal System

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

A modern, AI-powered grievance management system for educational institutions.

## ✨ Features

- 📝 **Smart Grievance Submission** - AI-powered categorization and priority detection
- 📊 **Real-time Dashboard** - Analytics and insights for administrators
- 👥 **Role-based Access** - Student, Faculty, Admin, HOD, Dean, Principal
- 🔄 **Live Updates** - Real-time sync with Firebase (optional)
- 🤖 **AI Analysis** - Sentiment analysis and auto-responses via Gemini AI
- 💾 **Offline Mode** - Works completely offline with localStorage

## 🚀 Quick Start

### Run Locally (No Setup Required!)

```bash
npm install
npm run dev
```

Open http://localhost:3000

**Login Credentials:**
- Admin: `admin@asmedu.org` / `asm@123`
- Faculty: `amrita.s@asmedu.org` / `asm@123`

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)

1. Click the button above
2. Connect your GitHub account
3. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🔧 Configuration

### Local Development (Default)

No configuration needed! The app runs with mock data and localStorage.

### Enable Firebase (Optional)

Update `.env.local`:

```env
VITE_USE_FIREBASE=true
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
# ... other Firebase config
```

### Enable Gemini AI (Optional)

```env
VITE_GEMINI_API_KEY=your_gemini_key
```

Get your key: https://aistudio.google.com/app/apikey

## 📁 Project Structure

```
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── GrievanceForm.tsx
│   ├── GrievanceList.tsx
│   └── ...
├── services/
│   ├── firebase.ts      # Firebase integration
│   ├── geminiService.ts # AI service
│   └── emailService.ts
├── App.tsx              # Main application
├── types.ts             # TypeScript definitions
└── .env.local           # Environment variables
```

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Database:** Firebase Firestore (optional)
- **AI:** Google Gemini (optional)
- **Hosting:** Vercel
- **Charts:** Recharts

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment instructions
- [Firebase Setup](./DEPLOYMENT.md#-enable-firebase-optional) - Configure cloud database
- [Gemini AI Setup](./DEPLOYMENT.md#-enable-gemini-ai-optional) - Enable AI features

## 🎯 Roadmap

- [ ] Email notifications
- [ ] File attachments
- [ ] PDF export
- [ ] Mobile app
- [ ] SMS alerts

## 📄 License

MIT License - feel free to use for your institution!

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

---

Built with ❤️ for ASM Nextgen Technical Campus
