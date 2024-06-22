const admin = require('firebase-admin');
const csv = require('csv-parser');
const fs = require('fs');

// Инициализация Firestore
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

// Путь к CSV файлу
const filePath = 'D:/firestore-setup/csv_ready/deep2241.csv';

fs.createReadStream(filePath)
  .pipe(csv({ separator: ';' })) // Используйте правильный разделитель
  .on('data', async (row) => {
    try {
      const id = row['id'];
      const type = row['type'];
      const model = row['model'];
      const SN = row['SN'];
      const region = row['region'];

      if (!id) {
        throw new Error('Missing id');
      }

      await db.collection('devices').doc(id).set({
        type,
        model,
        SN,
        region
      });
      console.log(`Added device with ID: ${id}`);
    } catch (error) {
      console.error(`Error adding device ${row['id']}: `, error);
    }
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });
