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

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Получение всех устройств
app.get('/getDevices', async (req, res) => {
  try {
    const devicesRef = db.collection('Devices');
    const snapshot = await devicesRef.get();
    const devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(devices);
  } catch (error) {
    console.error('Error getting devices:', error);
    res.status(500).send('Error getting devices');
  }
});

// Получение устройства по ID
app.get('/getDevice/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;
  try {
    const deviceRef = db.collection('Devices').doc(deviceId);
    const doc = await deviceRef.get();
    if (doc.exists) {
      res.json({ id: doc.id, data: doc.data() });
    } else {
      res.status(404).send('Device not found');
    }
  } catch (error) {
    console.error('Error getting device:', error);
    res.status(500).send('Error getting device');
  }
});

app.get('/getWorkTypes/:deviceType', async (req, res) => {
  const deviceType = req.params.deviceType.toLowerCase();
  const collectionName = `WorkTypes_${deviceType}`;
  console.log(`Fetching work types from collection: ${collectionName}`);
  try {
    const workTypesRef = db.collection(collectionName);
    const snapshot = await workTypesRef.get();
    const workTypes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Work types found:', workTypes); // Логирование для проверки
    res.json(workTypes);
  } catch (error) {
    console.error('Error getting work types:', error);
    res.status(500).send('Error getting work types');
  }
});
app.get('/getPreviousRepairs/:deviceNumber', async (req, res) => {
  const deviceNumber = req.params.deviceNumber;
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const repairsRef = db.collection('Repairs')
      .where('device_id', '==', deviceNumber)
      .where('installation_date', '>=', sixMonthsAgo.toISOString());

    const snapshot = await repairsRef.get();
    const repairs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json(repairs);
  } catch (error) {
    console.error('Error getting previous repairs:', error);
    res.status(500).send('Error getting previous repairs');
  }
});

// Получение всех ремонтов
app.get('/getRepairs', async (req, res) => {
  try {
    const repairsRef = db.collection('Repairs');
    const snapshot = await repairsRef.get();
    const repairs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(repairs);
  } catch (error) {
    console.error('Error getting repairs:', error);
    res.status(500).send('Error getting repairs');
  }
});

// Добавление нового акта ремонта
app.post('/addRepair', async (req, res) => {
  const { device_id, repair_type, work_count, installation_date } = req.body;
  try {
    const actsRef = db.collection('Acts');
    await actsRef.add({ device_id, repair_type, work_count, installation_date });
    res.status(201).send('Act added');
  } catch (error) {
    console.error('Error adding repair:', error);
    res.status(500).send('Error adding repair');
  }
});

// Загрузка данных о типах работ из CSV
app.post('/uploadWorkTypes', (req, res) => {
  const { collectionName, filePath } = req.body;
  try {
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
  } catch (error) {
    console.error('Error uploading work types:', error);
    res.status(500).send('Error uploading work types');
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server started on port', process.env.PORT || 3000);
});
