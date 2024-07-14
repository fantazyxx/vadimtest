import { createTable } from './utils.js';

export async function searchDeviceRepairs(deviceId, searchResultsDiv) {
  try {
    const url = `/getPreviousRepairs/${deviceId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch previous repairs: ${response.statusText}`);
    }
    const repairs = await response.json();
    searchResultsDiv.innerHTML = '';

    const repairHeaders = ['№', 'Тип ремонта', 'Дата'];
    const recentRepairRows = [];
    let repairIndex = 1;

    if (repairs.length === 0) {
      searchResultsDiv.textContent = 'Ремонтов за последние 6 месяцев не найдено';
    } else {
      repairs.forEach(repair => {
        recentRepairRows.push([repairIndex++, repair.repair_type, repair.installation_date]);
      });
      const repairTable = createTable(repairHeaders, recentRepairRows);
      searchResultsDiv.appendChild(repairTable);
    }

    const deviceResponse = await fetch(`/getDevice/${deviceId}`);
    const deviceData = await deviceResponse.json();
    const deviceType = deviceData.model;

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

    const recentRepairTypes = new Set(repairs.map(repair => repair.repair_type));
    const workTypeCells = workTypeTable.querySelectorAll('tbody tr td:nth-child(2)');
    workTypeCells.forEach(cell => {
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
