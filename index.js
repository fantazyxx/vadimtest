const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;  // Использование переменной PORT, предоставляемой Heroku

// Инициализация Firebase Admin SDK
const serviceAccount = require('./firebase-config.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Настройка Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Настройка статической папки для обслуживания HTML, CSS, JS файлов
app.use(express.static(path.join(__dirname, 'public')));

// Получение всех устройств
app.get('/devices', async (req, res) => {
  const devicesRef = db.collection('Devices');
  const snapshot = await devicesRef.get();
  const devices = snapshot.docs.map(doc => doc.data());
  res.json(devices);
});

// Получение устройства по ID
app.get('/getDevices', async (req, res) => {
  try {
    const devicesRef = db.collection('Devices');
    const snapshot = await devicesRef.get();
    const devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).send('Internal Server Error');
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

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
