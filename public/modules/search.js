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
    const deviceType = deviceData.type || deviceData.model; // Убедитесь, что это правильное свойство
    console.log('Данные устройства:', deviceData);
    console.log('Тип устройства:', deviceType);

    const recentRepairTypes = new Set(repairs.filter(repair => {
      console.log('Анализ ремонта:', repair);
      if (repair.device_id === deviceId) {
        const repairDate = new Date(repair.installation_date);
        console.log('Дата установки ремонта:', repairDate);
        return repairDate >= sixMonthsAgo;
      }
      return false;
    }).map(repair => repair.repair_type));

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

    // Fetch work types for the device type
    if (deviceType) {
      const workTypes = await fetchWorkTypes(deviceType);
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

      const workTypeCells = workTypeTable.querySelectorAll('tbody tr td:nth-child(2)');
      workTypeCells.forEach(cell => {
        console.log('Сравнение:', cell.textContent.trim(), recentRepairTypes.has(cell.textContent.trim()));
        if (recentRepairTypes.has(cell.textContent.trim())) {
          cell.parentNode.classList.add('completed-repair');
        }
      });
    } else {
      console.error('Тип устройства не определен');
    }

  } catch (error) {
    console.error('Error fetching repairs:', error);
    alert('Ошибка при загрузке ремонтов.');
  }
}

async function fetchWorkTypes(deviceType) {
  try {
    console.log('Запрос к /getWorkTypes/' + deviceType);
    const response = await fetch(`/getWorkTypes/${deviceType}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching work types:', error);
    return [];
  }
}
