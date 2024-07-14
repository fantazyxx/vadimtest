// search.js
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

    const repairHeaders = ['№', 'Тип ремонта', 'Дата'];
    const recentRepairRows = [];
    let repairIndex = 1;

    const deviceResponse = await fetch(`/getDevice/${deviceId}`);
    const deviceData = await deviceResponse.json();
    const deviceType = deviceData.data.model;
    console.log('Данные устройства:', deviceData);

    const recentRepairTypes = new Set(repairs.filter(repair => {
      console.log('Анализ ремонта:', repair);
      return repair.data && repair.data.device_id === deviceId && new Date(repair.data.installation_date) >= sixMonthsAgo;
    }).map(repair => repair.data.repair_type));

    console.log('recentRepairTypes: ', recentRepairTypes);

    repairs.filter(repair => {
      console.log('Фильтрация ремонта:', repair);
      return repair.data && repair.data.device_id === deviceId && new Date(repair.data.installation_date) >= sixMonthsAgo;
    }).forEach(repair => {
      recentRepairRows.push([repairIndex++, repair.data.repair_type, repair.data.installation_date]);
    });

    if (recentRepairRows.length > 0) {
      const repairTable = createTable(repairHeaders, recentRepairRows);
      searchResultsDiv.appendChild(repairTable);
    } else {
      searchResultsDiv.textContent = 'Ремонтов за последние 6 месяцев не найдено';
    }

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

  } catch (error) {
    console.error('Error fetching repairs:', error);
    alert('Ошибка при загрузке ремонтов.');
  }
}

async function fetchWorkTypes(deviceType) {
  try {
    const response = await fetch(`/getWorkTypes/${deviceType}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching work types:', error);
    return [];
  }
}
