const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
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

// Получение списка устройств
app.get('/getDevices', async (req, res) => {
  try {
    const devicesRef = db.collection('Devices');
    const snapshot = await devicesRef.get();
    if (snapshot.empty) {
      res.status(404).send('No devices found');
      return;
    }
    const devices = [];
    snapshot.forEach(doc => {
      devices.push({ id: doc.id, data: doc.data() });
    });
    res.status(200).json(devices);
  } catch (error) {
    console.error('Error getting devices:', error);  // Логирование ошибок
    res.status(500).send('Error getting devices: ' + error.message);
  }
});


// Получение информации об устройстве по системному номеру
app.get('/getDevice/:id', async (req, res) => {
  const deviceId = req.params.id;
  try {
    const deviceRef = db.collection('Devices').doc(deviceId);
    const doc = await deviceRef.get();
    if (!doc.exists) {
      res.status(404).send('Device not found');
      return;
    }
    res.status(200).json({ id: doc.id, data: doc.data() });
  } catch (error) {
    res.status(500).send('Error getting device: ' + error.message);
  }
});

// Получение списка всех типов работ
app.get('/getWorkTypes', async (req, res) => {
  try {
    const workTypesRef = db.collection('WorkTypes');
    const snapshot = await workTypesRef.get();
    if (snapshot.empty) {
      res.status(404).send('No work types found');
      return;
    }
    const workTypes = [];
    snapshot.forEach(doc => {
      workTypes.push({ id: doc.id, data: doc.data() });
    });
    res.status(200).json(workTypes);
  } catch (error) {
    res.status(500).send('Error getting work types: ' + error.message);
  }
});

// Получение типа работы по идентификатору
app.get('/getWorkType/:id', async (req, res) => {
  const workTypeId = req.params.id;
  try {
    const workTypeRef = db.collection('WorkTypes').doc(workTypeId);
    const doc = await workTypeRef.get();
    if (!doc.exists) {
      res.status(404).send('Work type not found');
      return;
    }
    res.status(200).json({ id: doc.id, data: doc.data() });
  } catch (error) {
    res.status(500).send('Error getting work type: ' + error.message);
  }
});

// Добавление нового типа работы
app.post('/addWorkType', async (req, res) => {
  const { work_type, cost } = req.body;
  try {
    await db.collection('WorkTypes').doc(work_type).set({
      cost,
    });
    res.send('Work type added successfully');
  } catch (error) {
    res.status(500).send('Error adding work type: ' + error.message);
  }
});

// Добавление нового ремонта
app.post('/addRepair', async (req, res) => {
  const { repair_id, device_id, repair_type, work_count, installation_date } = req.body;
  try {
    await db.collection('Repairs').doc(repair_id).set({
      device_id,
      repair_type,
      work_count,
      installation_date,
    });
    res.send('Repair added successfully');
  } catch (error) {
    res.status(500).send('Error adding repair: ' + error.message);
  }
});

// Получение списка всех ремонтов
app.get('/getRepairs', async (req, res) => {
  try {
    const repairsRef = db.collection('Repairs');
    const snapshot = await repairsRef.get();
    if (snapshot.empty) {
      res.status(404).send('No repairs found');
      return;
    }
    const repairs = [];
    snapshot.forEach(doc => {
      repairs.push({ id: doc.id, data: doc.data() });
    });
    res.status(200).json(repairs);
  } catch (error) {
    res.status(500).send('Error getting repairs: ' + error.message);
  }
});

// Получение деталей ремонта по идентификатору
app.get('/getRepair/:id', async (req, res) => {
  const repairId = req.params.id;
  try {
    const repairRef = db.collection('Repairs').doc(repairId);
    const doc = await repairRef.get();
    if (!doc.exists) {
      res.status(404).send('Repair not found');
      return;
    }
    res.status(200).json({ id: doc.id, data: doc.data() });
  } catch (error) {
    res.status(500).send('Error getting repair: ' + error.message);
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
