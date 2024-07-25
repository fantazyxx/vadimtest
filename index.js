const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

const { db } = require('./firebase');

const app = express();
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/generateReport/:month/:year', async (req, res) => {
  const month = req.params.month;
  const year = req.params.year;
  console.log(`Generating report for ${month}/${year}`);

  try {
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    console.log(`Fetching repairs from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    const repairsRef = db.collection('Repairs');
    const repairDocs = await repairsRef.where('installation_date', '>=', startDate).where('installation_date', '<=', endDate).get();

    let repairs = [];
    repairDocs.forEach(doc => {
      repairs.push(doc.data());
    });

    console.log('Fetched repairs:', repairs);

    let regions = repairs.map(repair => repair.region).filter((value, index, self) => self.indexOf(value) === index);
    let regionChunks = [];
    while (regions.length) {
      regionChunks.push(regions.splice(0, 30));
    }

    let repairsByRegion = [];
    for (let chunk of regionChunks) {
      const regionDocs = await repairsRef.where('region', 'in', chunk).get();
      regionDocs.forEach(doc => {
        repairsByRegion.push(doc.data());
      });
    }

    console.log('Repairs by region:', repairsByRegion);

    res.json({ repairsByRegion });
  } catch (error) {
    console.error('Ошибка при формировании отчета:', error);
    res.status(500).json({ error: 'Ошибка при формировании отчета' });
  }
});

function isValidMonth(month) {
  return month >= 1 && month <= 12;
}

async function isValidYear(year) {
  try {
    const firstRepairSnapshot = await db.collection('Repairs').orderBy('installation_date', 'asc').limit(1).get();

    if (!firstRepairSnapshot.empty) {
      const firstRepairDate = firstRepairSnapshot.docs[0].data().installation_date;
      const firstRepairYear = new Date(firstRepairDate).getFullYear();
      return year >= firstRepairYear;
    } else {
      // Если ремонтов нет, разрешаем любой год
      return true;
    }
  } catch (error) {
    console.error('Ошибка при получении первого года ремонта:', error);
    return false; // В случае ошибки считаем год недопустимым
  }
}

function formatDate(dateStr) {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('ru-RU', options);
}

// Вставьте функцию formatDate перед функцией generateReport
function formatDate(dateStr) {
  // Преобразуем строку даты в объект Date
  const date = new Date(dateStr);
  
  // Проверяем, является ли дата допустимой
  if (isNaN(date.getTime())) {
    console.error('Invalid date format:', dateStr);
    return 'Invalid Date';
  }

  // Преобразуем объект Date в форматируемую строку
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return date.toLocaleDateString('ru-RU', options);
}


async function generateReport(month, year) {
  console.log(`Generating report for ${month}/${year}`); // Логирование
  if (!isValidMonth(month) || !await isValidYear(year)) {
    throw new Error('Некорректные параметры месяца и года.');
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const formattedStartDate = startDate.toISOString().slice(0, 10);
  const formattedEndDate = endDate.toISOString().slice(0, 10);
  console.log(`Fetching repairs from ${formattedStartDate} to ${formattedEndDate}`); // Логирование
  const repairsRef = db.collection('Repairs');
  const snapshot = await repairsRef
    .where('installation_date', '>=', formattedStartDate)
    .where('installation_date', '<=', formattedEndDate)
    .get();

  if (snapshot.empty) {
    console.log('No repairs found for the specified period.'); // Логирование
    return {}; 
  }

  const repairsByRegion = {};
  const deviceIds = snapshot.docs.map(doc => doc.data().device_id);

  // Получение данных об устройствах за один запрос
  const devicesSnapshot = await db.collection('Devices')
    .where('__name__', 'in', deviceIds)
    .get();

  const devicesData = {};
  devicesSnapshot.forEach(doc => devicesData[doc.id] = doc.data());

  for (const doc of snapshot.docs) {
    const repairData = doc.data();
    const deviceData = devicesData[repairData.device_id];

    if (!deviceData) {
      console.error(`Устройство с ID ${repairData.device_id} не найдено для ремонта ${doc.id}`);
      continue; // Пропускаем ремонт, если устройство не найдено
    }

    const region = deviceData.region || 'Не указан';
    const model = deviceData.model;
    const workTypes = repairData.repair_type.split(',').map(type => type.trim().toLowerCase());

    for (const workType of workTypes) {
      let price = 0;
      const workTypeCollection = db.collection(`WorkTypes_${model}`);
      const workTypeDocs = await workTypeCollection.where('__name__', '==', workType).get();

      if (!workTypeDocs.empty) {
        const workTypeDoc = workTypeDocs.docs[0];
        price = workTypeDoc.data().price || 0;
      } else {
        console.error(`Тип работы "${workType}" не найден для модели устройства "${model}"`);
      }

      if (!repairsByRegion[region]) {
        repairsByRegion[region] = [];
      }

      repairsByRegion[region].push({
        act_number: doc.id,
        device_id: repairData.device_id,
        model: model,
        repair_type: workType,
        date: formatDate(repairData.installation_date),
        work_count: repairData.work_count,
        price: price
      });
    }
  }

  return repairsByRegion;
}


// Получение всех устройств
app.get('/getDevices', async (req, res) => {
  try {
    const devicesRef = db.collection('Devices');
    const snapshot = await devicesRef.get();
    const devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(devices);
  } catch (error) {
    console.error('Error getting devices:', error);
    res.status(500).json({ error: 'Error getting devices' });
  }
});

// Получение устройства по ID
app.get('/getDevice/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;
  console.log('Запрос на получение устройства с ID:', deviceId);
  try {
    const deviceRef = db.collection('Devices').doc(deviceId);
    const doc = await deviceRef.get();
    if (doc.exists) {
      console.log('Устройство найдено:', doc.data());
      res.json({ id: doc.id, data: doc.data() });
    } else {
      console.log('Устройство не найдено');
      res.status(404).json({ error: 'Device not found' });
    }
  } catch (error) {
    console.error('Error getting device:', error);
    res.status(500).json({ error: 'Error getting device' });
  }
});

// Получение типов работ по типу устройства
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
    res.status(500).json({ error: 'Error getting work types' });
  }
});

// Получение предыдущих ремонтов за последние 6 месяцев
app.get('/getPreviousRepairs/:deviceNumber', async (req, res) => {
  const deviceNumber = req.params.deviceNumber;
  console.log(`Fetching previous repairs for device: ${deviceNumber}`); // Логирование

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const repairsRef = db.collection('Repairs')
      .where('device_id', '==', deviceNumber)
      .where('installation_date', '>=', sixMonthsAgo.toISOString());

    const snapshot = await repairsRef.get();
    const repairs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`Repairs found: ${JSON.stringify(repairs)}`); // Логирование

    res.json(repairs);
  } catch (error) {
    console.error('Error getting previous repairs:', error);
    res.status(500).json({ error: 'Error getting previous repairs' });
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
    res.status(500).json({ error: 'Error getting repairs' });
  }
});

// Добавление нового акта ремонта
app.post('/addRepair', async (req, res) => {
  const { repair_id, device_id, repair_type, work_count, installation_date } = req.body;
  try {
    const actsRef = db.collection('Repairs').doc(repair_id); // Используем repair_id как идентификатор документа
    await actsRef.set({ device_id, repair_type, work_count, installation_date });
    res.status(201).json({ message: 'Act added' });
  } catch (error) {
    console.error('Error adding repair:', error);
    res.status(500).json({ error: 'Error adding repair' });
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
        res.status(200).json({ message: 'Work types uploaded' });
      });
  } catch (error) {
    console.error('Error uploading work types:', error);
    res.status(500).json({ error: 'Error uploading work types' });
  }
});
app.post('/addDevice', async (req, res) => {
  const { deviceNumber, deviceModel, factorySerialNumber, region, deviceType } = req.body;

  try {
    const deviceRef = db.collection('Devices').doc(deviceNumber);
    await deviceRef.set({
      model: deviceModel,
      factory_serial_number: factorySerialNumber,
      region: region,
      type: deviceType
    });

    res.status(200).send('Устройство успешно добавлено!');
  } catch (error) {
    console.error('Error adding device:', error);
    res.status(500).send('Ошибка при добавлении устройства.');
  }
});



app.listen(process.env.PORT || 3000, () => {
  console.log('Server started on port', process.env.PORT || 3000);
});
