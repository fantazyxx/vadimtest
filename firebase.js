const admin = require('firebase-admin');

// Убедитесь, что путь к файлу конфигурации берется из переменной окружения
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { db };
