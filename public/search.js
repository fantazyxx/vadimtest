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

    // Сбор типов ремонта, которые были выполнены за последние 6 месяцев
    const recentRepairTypes = new Set(repairs.filter(repair => repair.data.device_id === deviceId && new Date(repair.data.installation_date) >= sixMonthsAgo).map(repair => repair.data.repair_type));
    console.log('recentRepairTypes: ', recentRepairTypes);

    repairs.filter(repair => repair.data.device_id === deviceId && new Date(repair.data.installation_date) >= sixMonthsAgo).forEach(repair => {
      recentRepairRows.push([repairIndex++, repair.data.repair_type, repair.data.installation_date]);
    });

    if (recentRepairRows.length > 0) {
      const repairTable = createTable(repairHeaders, recentRepairRows);
      searchResultsDiv.appendChild(repairTable);
    } else {
      searchResultsDiv.textContent = 'Ремонтов за последние 6 месяцев не найдено';
    }

    console.log('Запрос к /getWorkTypes');
    const workTypesResponse = await fetch('/getWorkTypes');
    const workTypes = await workTypesResponse.json();
    console.log('Данные типов работ:', workTypes);
    let workTypeIndex = 1;

    const workTypeHeaders = ['№', 'Тип работ', 'Стоимость работ'];
    const workTypeRows = [];

    workTypes.forEach(workType => {
      const row = [workTypeIndex++, workType.id, workType.data.cost];
      workTypeRows.push(row);
    });

    const workTypeTable = createTable(workTypeHeaders, workTypeRows);
    searchResultsDiv.appendChild(workTypeTable);

    // Находим и выделяем выполненные работы
    const workTypeCells = workTypeTable.querySelectorAll('tbody tr td:nth-child(2)'); // Оптимизация
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
