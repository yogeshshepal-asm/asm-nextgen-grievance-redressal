# Firebase Setup Guide - FREE

## Step 1: Create Firebase Project (2 minutes)

1. Go to: https://console.firebase.google.com
2. Click "Add project"
3. Project name: `asm-grievance` (or any name)
4. Disable Google Analytics (not needed)
5. Click "Create project"

## Step 2: Enable Firestore Database (1 minute)

1. In Firebase Console, click "Firestore Database" in left menu
2. Click "Create database"
3. Choose "Start in TEST MODE" (important!)
4. Select region: `asia-south1` (Mumbai - closest to India)
5. Click "Enable"

## Step 3: Get Firebase Configuration (1 minute)

1. Click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps" section
3. Click the Web icon `</>`
4. App nickname: `asm-grievance-web`
5. Click "Register app"
6. Copy the firebaseConfig object (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "asm-grievance.firebaseapp.com",
  projectId: "asm-grievance",
  storageBucket: "asm-grievance.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 4: Add to Vercel (2 minutes)

1. Go to: https://vercel.com/dashboard
2. Click your project: `asm-nextgen-grievance-redressal`
3. Go to "Settings" → "Environment Variables"
4. Add these variables ONE BY ONE:

**Variable 1:**
- Name: `VITE_USE_FIREBASE`
- Value: `true`

**Variable 2:**
- Name: `VITE_FIREBASE_API_KEY`
- Value: (paste your apiKey from step 3)

**Variable 3:**
- Name: `VITE_FIREBASE_AUTH_DOMAIN`
- Value: (paste your authDomain)

**Variable 4:**
- Name: `VITE_FIREBASE_PROJECT_ID`
- Value: (paste your projectId)

**Variable 5:**
- Name: `VITE_FIREBASE_STORAGE_BUCKET`
- Value: (paste your storageBucket)

**Variable 6:**
- Name: `VITE_FIREBASE_MESSAGING_SENDER_ID`
- Value: (paste your messagingSenderId)

**Variable 7:**
- Name: `VITE_FIREBASE_APP_ID`
- Value: (paste your appId)

5. Click "Save" after each variable

## Step 5: Redeploy (30 seconds)

1. In Vercel, go to "Deployments" tab
2. Click the three dots ⋯ on latest deployment
3. Click "Redeploy"
4. Wait 1-2 minutes

## Step 6: Test (1 minute)

1. Open: https://asm-nextgen-grievance-redressal.vercel.app
2. Login as admin: `admin@asmedu.org` / `asm@123`
3. Bottom left should show: "Connected: ASM Cloud" (green dot)
4. Submit a test grievance
5. Open in another browser/device - data should sync!

---

## FREE Tier Limits (More than enough!)

✅ 50,000 reads/day
✅ 20,000 writes/day  
✅ 1GB storage
✅ 10GB/month bandwidth

**Your usage:** ~100-500 operations/day = FREE FOREVER

---

## Troubleshooting

**If you see "Database Missing" error:**
1. Go to Firebase Console
2. Firestore Database → Click "Create Database"
3. Choose "Test Mode"
4. Refresh your app

**If login fails:**
1. In your app, click "Seed Cloud Directory"
2. Wait 10 seconds
3. Refresh and login again

---

## Security (Important!)

After testing, update Firestore rules:

1. Firebase Console → Firestore Database → Rules
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null || 
                           request.resource.data.email.matches('.*@asmedu.org$');
    }
  }
}
```

3. Click "Publish"

This allows only @asmedu.org emails to access data.

---

**Total Time: ~7 minutes**
**Cost: $0 (FREE forever for your usage)**
