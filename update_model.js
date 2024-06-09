const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateModel() {
  const devicesRef = db.collection('Devices');
  const snapshot = await devicesRef.where('model', '==', 'УНА-001').get();

  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }

  const batch = db.batch();
  snapshot.forEach(doc => {
    batch.update(doc.ref, { model: 'УНА 001-03' });
  });

  await batch.commit();
  console.log('All models updated to УНА 001-03');
}

updateModel().catch(console.error);
