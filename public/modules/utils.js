// utils.js
  export function createTable(headers, rows) {
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  const thead = table.createTHead();
  const headerRow = thead.insertRow();

  headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.style.border = '1px solid #ddd';
      th.style.padding = '8px';
      th.style.textAlign = 'left';
      headerRow.appendChild(th);
  });

  const tbody = table.createTBody();

  rows.forEach(row => {
      const tr = tbody.insertRow();
      row.forEach((cellText, index) => {
          const td = tr.insertCell();
          td.textContent = cellText;
          td.style.border = '1px solid #ddd';
          td.style.padding = '8px';
          td.style.textAlign = 'left';

          // Добавляем класс 'completed-repair' для завершенных ремонтов
          if (index === 1 && row.completed) {
              tr.classList.add('completed-repair');
          }
      });
  });

  return table;
}

  export function clearForm(actForm, deviceTypeInput, previousRepairsList, repairListDiv, totalCostInput, repairsToAdd) {
  actForm.reset();
  deviceTypeInput.value = '';
  previousRepairsList.innerHTML = '';
  const repairItems = repairListDiv.querySelectorAll('.inline');
  repairItems.forEach(item => repairListDiv.removeChild(item));
  totalCostInput.value = '';
  repairsToAdd.length = 0; // Очистить массив repairsToAdd
}
export function clearSearch(searchDeviceIdInput, searchResultsDiv) {
  searchDeviceIdInput.value = '';
  searchResultsDiv.innerHTML = '';
}

  export function updateRepairsToAdd(selectedRepair, repairsToAdd) {
    const index = repairsToAdd.indexOf(selectedRepair);
    if (index === -1) {
      repairsToAdd.push(selectedRepair);
    } else {
      repairsToAdd.splice(index, 1); // Видаляємо елемент за індексом
    }
    return repairsToAdd; // Повертаємо оновлений масив
  }
  
  export function populateRegionSelect(regionSelect, uniqueRegions) {
    regionSelect.innerHTML = '<option value="">--</option>';
    uniqueRegions.forEach(region => {
      const option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });
  }

  export function clearAddDeviceForm(deviceForm) {
    document.getElementById('device-number').value = '';
    document.getElementById('device-type').value = '';
    document.getElementById('device-model').innerHTML = '<option value="">--</option>';
    document.getElementById('factory-serial-number').value = '';
    document.getElementById('region').value = '';
  }
  
  export function displayReport(repairsByRegion) {
    const reportDiv = document.getElementById('report-results');
    reportDiv.innerHTML = ''; 
    console.log('displayReport - Received repairsByRegion:', repairsByRegion); // Логирование полученных данных

    if (Object.keys(repairsByRegion).length === 0) {
      reportDiv.innerHTML = 'Нет данных для отчета за этот период.';
      return;
    }

    if (typeof repairsByRegion !== 'object' || repairsByRegion === null) {
      console.error('Некорректный формат данных отчета:', repairsByRegion);
      reportDiv.innerHTML = 'Ошибка при обработке отчета.';
      return;
    }
  
    for (const [region, repairs] of Object.entries(repairsByRegion)) {
      console.log('displayReport - Processing region:', region, 'with repairs:', repairs); // Логирование данных по регионам
      const regionHeader = document.createElement('h3');
      regionHeader.textContent = `Регион: ${region}`;
      regionHeader.style.backgroundColor = 'grey';
      regionHeader.style.color = 'white';
      reportDiv.appendChild(regionHeader);
  
      const table = document.createElement('table');
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `
        <th>Номер акта</th>
        <th>Номер устройства</th>
        <th>Тип работы</th>
        <th>Дата</th>
        <th>Сумма</th>
      `;
      table.appendChild(headerRow);
  
      let regionTotal = 0;
  
      repairs.forEach(repair => {
        console.log('displayReport - Processing repair:', repair); // Логирование данных по каждому ремонту
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${repair.act_number}</td>
          <td>${repair.device_id}</td>
          <td>${repair.repair_type}</td>
          <td>${new Date(repair.date).toDateString()}</td> // Используем преобразованное поле date
          <td>${repair.cost}</td>
        `;
        table.appendChild(row);
        regionTotal += repair.cost;
      });
  
      const totalRow = document.createElement('tr');
      totalRow.innerHTML = `
        <td colspan="4" style="text-align: right;"><strong>Всего: ${region}</strong></td>
        <td><strong>${regionTotal} грн</strong></td>
      `;
      table.appendChild(totalRow);
  
      reportDiv.appendChild(table);
    }
      // Убедимся, что блок с результатами отображается
  reportDiv.style.display = 'block';
}


  