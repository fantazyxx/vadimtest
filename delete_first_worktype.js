const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteFirstWorkType() {
  const workTypesRef = db.collection('WorkTypes');
  const snapshot = await workTypesRef.orderBy('cost').limit(1).get();

  if (snapshot.empty) {
    console.log('No work types found.');
    return;
  }

  snapshot.forEach(async doc => {
    await doc.ref.delete();
    console.log('Deleted work type:', doc.id);
  });
}

deleteFirstWorkType().catch(console.error);
