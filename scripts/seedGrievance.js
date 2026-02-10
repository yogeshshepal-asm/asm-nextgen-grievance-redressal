/*
Simple Firebase Admin seed script to create a properly formed grievance document.
Usage:
  1. Place your Firebase service account JSON at ./serviceAccountKey.json
  2. Set FIREBASE_PROJECT_ID env var if needed, or the service account must match project.
  3. Install firebase-admin: npm install firebase-admin
  4. Run: node scripts/seedGrievance.js

This script creates a single document in the `grievances` collection with a `createdAt` timestamp.
*/

import fs from 'fs';
import path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const keyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('serviceAccountKey.json not found in project root.');
  console.error('Put your Firebase service account JSON at ./serviceAccountKey.json and try again.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

(async () => {
  try {
    const sample = {
      subject: 'Canteen cleanliness concern',
      description: 'Canteen was unhygienic on 2026-02-09',
      userId: 'std-d39qj',
      userName: 'yogesh shepal',
      userRole: 'Student',
      priority: 'Medium',
      status: 'Pending',
      category: 'Infrastructure',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: {
        id: 'faculty-001',
        name: 'Infrastructure Cell Lead',
        email: 'infra@asmedu.org'
      },
      aiInsights: {
        sentiment: 'Negative',
        summary: 'Canteen cleanliness concern',
        suggestedAction: 'Inspect canteen and clean.'
      }
    };

    const docRef = await db.collection('grievances').add(sample);
    console.log('Created grievance with id:', docRef.id);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create grievance:', err);
    process.exit(1);
  }
})();
