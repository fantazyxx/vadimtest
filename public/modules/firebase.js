import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = path.resolve(__dirname, '../../firebase-config.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

export { db };
