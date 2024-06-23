const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const serviceAccount = require('./firebase-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Получение всех устройств
app.get('/devices', async (req, res) => {
  const devicesRef = db.collection('Devices');
  const snapshot = await devicesRef.get();
  const devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(devices);
});

// Получение устройства по ID
app.get('/getDevice/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;
  const deviceRef = db.collection('Devices').doc(deviceId);
  const doc = await deviceRef.get();
  if (doc.exists) {
    res.json({ id: doc.id, data: doc.data() });
  } else {
    res.status(404).send('Device not found');
  }
});

// Получение всех типов работ для устройства
app.get('/getWorkTypes/:deviceType', async (req, res) => {
  const deviceType = req.params.deviceType;
  const collectionName = `WorkTypes_${deviceType}`;
  const workTypesRef = db.collection(collectionName);
  const snapshot = await workTypesRef.get();
  const workTypes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(workTypes);
});

// Получение всех ремонтов
app.get('/getRepairs', async (req, res) => {
  const repairsRef = db.collection('Acts');
  const snapshot = await repairsRef.get();
  const repairs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(repairs);
});

// Добавление нового акта ремонта
app.post('/addRepair', async (req, res) => {
  const { device_id, repair_type, work_count, installation_date } = req.body;
  const actsRef = db.collection('Acts');
  await actsRef.add({ device_id, repair_type, work_count, installation_date });
  res.status(201).send('Act added');
});

// Загрузка данных о типах работ из CSV
app.post('/uploadWorkTypes', (req, res) => {
  const { collectionName, filePath } = req.body;

  fs.createReadStream(path.resolve(__dirname, filePath))
    .pipe(csvParser({ headers: ['WorkType', 'Price'], separator: ';' }))
    .on('data', async (row) => {
      const workType = row['WorkType'];
      const price = row['Price'];
      const docRef = db.collection(collectionName).doc(workType);
      await docRef.set({ price });
    })
    .on('end', () => {
      res.status(200).send('Work types uploaded');
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
