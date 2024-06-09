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
    const repairRows = [];
    let repairIndex = 1;

    repairs.filter(repair => repair.data.device_id === deviceId && new Date(repair.data.installation_date) >= sixMonthsAgo).forEach(repair => {
      repairRows.push([repairIndex++, repair.data.repair_type, repair.data.installation_date]);
    });

    if (repairRows.length > 0) {
      const repairTable = createTable(repairHeaders, repairRows);
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
      const row = [workTypeIndex++, workType.data.work_type, workType.data.cost];
      if (repairRows.some(repairRow => repairRow[1] === workType.data.work_type)) {
        row[1] = `${workType.data.work_type} (выполнено)`;
        row[2] = `${workType.data.cost} (выполнено)`;
        row.completed = true;
      }
      workTypeRows.push(row);
    });

    const workTypeTable = createTable(workTypeHeaders, workTypeRows);
    searchResultsDiv.appendChild(workTypeTable);

    workTypeRows.forEach((row, index) => {
      if (row.completed) {
        const tr = workTypeTable.querySelectorAll('tbody tr')[index];
        tr.style.backgroundColor = '#d3d3d3';
        tr.style.textDecoration = 'line-through';
      }
    });
  } catch (error) {
    console.error('Error fetching repairs:', error);
    alert('Ошибка при загрузке ремонтов.');
  }
}
