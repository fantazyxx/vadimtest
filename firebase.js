const admin = require('firebase-admin');
const fs = require('fs');

// Используйте путь к файлу `firebase-config.json`
const serviceAccount = JSON.parse(fs.readFileSync('./firebase-config.json', 'utf8'));

// Добавьте отладочный вывод
console.log('Service account loaded:', serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { db };
