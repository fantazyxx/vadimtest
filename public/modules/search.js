import { createTable } from './utils.js';

export async function searchDeviceRepairs(deviceId, searchResultsDiv) {
  try {
    console.log('Запрос к /getRepairs');
    const response = await fetch('/getRepairs');
    const repairs = await response.json();
    console.log('Данные ремонтов:', repairs);
    searchResultsDiv.innerHTML = '';

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    console.log('Шесть месяцев назад:', sixMonthsAgo);

    const repairHeaders = ['№', 'Тип ремонта', 'Дата'];
    const recentRepairRows = [];
    let repairIndex = 1;

    const deviceResponse = await fetch(`/getDevice/${deviceId}`);
    const deviceData = await deviceResponse.json();
    console.log('Полный ответ сервера:', deviceData);
    const device = deviceData.data || deviceData;
    console.log('Извлеченные данные устройства:', device);
    const deviceModel = device.model || device.type;
    console.log('Извлеченная модель устройства:', deviceModel);

    if (!deviceModel) {
      console.error('Модель устройства не определена');
      return;
    }

    const recentRepairTypes = new Set(repairs.filter(repair => {
      console.log('Анализ ремонта:', repair);
      if (repair.device_id === deviceId) {
        const repairDate = new Date(repair.installation_date);
        console.log('Дата установки ремонта:', repairDate);
        return repairDate >= sixMonthsAgo;
      }
      return false;
    }).map(repair => repair.repair_type.trim().toLowerCase()));

    console.log('recentRepairTypes:', recentRepairTypes);

    const recentRepairs = repairs.filter(repair => {
      console.log('Фильтрация ремонта:', repair);
      if (repair.device_id === deviceId) {
        const repairDate = new Date(repair.installation_date);
        console.log('Дата установки ремонта для фильтрации:', repairDate);
        return repairDate >= sixMonthsAgo;
      }
      return false;
    });

    recentRepairs.forEach(repair => {
      recentRepairRows.push([repairIndex++, repair.repair_type, repair.installation_date]);
    });

    if (recentRepairRows.length > 0) {
      const repairTable = createTable(repairHeaders, recentRepairRows);
      searchResultsDiv.appendChild(repairTable);
    } else {
      searchResultsDiv.innerHTML = 'Ремонтов за последние 6 месяцев не найдено';
    }

    console.log('Начало запроса типов работ для модели устройства:', deviceModel);
    const workTypes = await fetchWorkTypes(deviceModel);
    console.log('Данные типов работ:', workTypes);
    let workTypeIndex = 1;

    const workTypeHeaders = ['№', 'Тип работ', 'Стоимость работ'];
    const workTypeRows = [];

    workTypes.forEach(workType => {
      const row = [workTypeIndex++, workType.id, workType.price];
      workTypeRows.push(row);
    });

    const workTypeTable = createTable(workTypeHeaders, workTypeRows);
    searchResultsDiv.appendChild(workTypeTable);

    // Применяем стили только после полной загрузки таблицы
    setTimeout(() => {
      applyCompletedRepairStyles(workTypeTable, recentRepairTypes);
    }, 0);
  } catch (error) {
    console.error('Error fetching repairs:', error);
    alert('Ошибка при загрузке ремонтов.');
  }
}

async function fetchWorkTypes(deviceModel) {
  try {
    console.log('Запрос к /getWorkTypes/' + deviceModel);
    const response = await fetch(`/getWorkTypes/${deviceModel}`);
    const data = await response.json();
    console.log('Получены данные типов работ:', data);
    return data;
  } catch (error) {
    console.error('Error fetching work types:', error);
    return [];
  }
}

function applyCompletedRepairStyles(workTypeTable, recentRepairTypes) {
  const workTypeCells = workTypeTable.querySelectorAll('tbody tr td:nth-child(2)');
  
  // Нормализуем recentRepairTypes
  const normalizedRecentRepairs = new Set(Array.from(recentRepairTypes).map(type => type.trim().toLowerCase()));
  
  workTypeCells.forEach(cell => {
    const workType = cell.textContent.trim().toLowerCase();
    console.log('Сравнение:', workType, normalizedRecentRepairs.has(workType));
    
    if (normalizedRecentRepairs.has(workType)) {
      cell.parentNode.classList.add('completed-repair');
      cell.style.textDecoration = 'line-through'; // Добавляем зачеркивание
      cell.parentNode.style.backgroundColor = '#f0f0f0'; // Добавляем серый фон
    }
  });
}
