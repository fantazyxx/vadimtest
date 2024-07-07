import { loadDeviceNumbers, loadDeviceType, fetchWorkTypes, updateTotalCost } from '/modules/api.js';
import { clearForm, clearSearch, clearAddDeviceForm } from '/modules/utils.js';
import { searchDeviceRepairs } from './search.js';
import { createTable } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
  const addActButton = document.getElementById('add-act-button');
  const searchDeviceButton = document.getElementById('search-device-button');
  const addDeviceButton = document.getElementById('add-device-button');
  const formContainer = document.getElementById('form-container');
  const searchContainer = document.getElementById('search-container');
  const addDeviceContainer = document.getElementById('add-device-container');
  const menuPage = document.getElementById('menu');
  const backButton = document.getElementById('back-button');
  const searchBackButton = document.getElementById('search-back-button');
  const addDeviceBackButton = document.getElementById('add-device-back-button');
  const searchButton = document.getElementById('search-button');
  const actForm = document.getElementById('act-form');
  const deviceNumberSelect = document.getElementById('device-number-select');
  const deviceTypeInput = document.getElementById('device-type-input');
  const previousRepairsList = document.getElementById('previous-repairs-list');
  const addRepairButton = document.getElementById('add-repair-button');
  const repairListDiv = document.getElementById('repair-list');
  const totalCostInput = document.getElementById('total-cost');
  const searchDeviceIdInput = document.getElementById('search-device-id');
  const searchResultsDiv = document.getElementById('search-results');

  searchDeviceIdInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchButton.click();
    }
  });

  const regionSelect = document.getElementById('region');

  let repairsToAdd = [];
  let totalCost = 0;

  const uniqueRegions = [
    "Тернопіль", "Чернігів", "Прилуки", "Черкаси", "Чернівці", "Дніпро", "Закарпаття",
    "Рівне", "Харків", "Херсон", "Хмельницький", "Івано Франківськ", "Київ", "Кіровоград",
    "Кривий ріг", "Львів", "Миколаїв", "Одеса", "Полтава", "Кременчуг", "Суми", "Волинь", "Вінниця", "Запоріжжя"
  ];

  function populateRegionSelect() {
    regionSelect.innerHTML = '<option value="">--</option>';
    uniqueRegions.forEach(region => {
      const option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });
  }

  populateRegionSelect();

  addActButton.addEventListener('click', () => {
    console.log('Add Act button clicked');
    menuPage.style.display = 'none';
    formContainer.style.display = 'block';
    loadDeviceNumbers(deviceNumberSelect);
  });

  searchDeviceButton.addEventListener('click', () => {
    console.log('Search Device button clicked');
    menuPage.style.display = 'none';
    searchContainer.style.display = 'block';
  });

  addDeviceButton.addEventListener('click', () => {
    console.log('Add Device button clicked');
    menuPage.style.display = 'none';
    addDeviceContainer.style.display = 'block';
  });

  backButton.addEventListener('click', () => {
    console.log('Back button clicked');
    clearForm(actForm, deviceTypeInput, previousRepairsList, repairListDiv, totalCostInput, repairsToAdd);
    formContainer.style.display = 'none';
    menuPage.style.display = 'block';
  });

  searchBackButton.addEventListener('click', () => {
    console.log('Search Back button clicked');
    clearSearch(searchDeviceIdInput, searchResultsDiv);
    searchContainer.style.display = 'none';
    menuPage.style.display = 'block';
  });

  addDeviceBackButton.addEventListener('click', () => {
    const deviceForm = document.getElementById('device-form');
    console.log('Add Device Back button clicked');
    clearAddDeviceForm(deviceForm);
    addDeviceContainer.style.display = 'none';
    menuPage.style.display = 'block';
  });

  searchButton.addEventListener('click', () => {
    const deviceId = searchDeviceIdInput.value;
    if (deviceId) {
      searchDeviceRepairs(deviceId, searchResultsDiv);
    }
  });

  deviceNumberSelect.addEventListener('change', async () => {
    const deviceNumber = deviceNumberSelect.value;
    if (deviceNumber) {
      const deviceType = await loadDeviceType(deviceNumber, deviceTypeInput);
      await loadPreviousRepairs(deviceNumber, previousRepairsList);
      document.getElementById('add-repair-button').style.display = 'inline-block'; // Ensure the button is displayed
    } else {
      deviceTypeInput.value = '';
      previousRepairsList.innerHTML = '';
      document.getElementById('add-repair-button').style.display = 'none'; // Hide the button if no device number
    }
  });

  deviceNumberSelect.addEventListener('change', async () => {
    const deviceNumber = deviceNumberSelect.value;
    if (deviceNumber) {
      const deviceType = await loadDeviceType(deviceNumber, deviceTypeInput);
      await loadPreviousRepairs(deviceNumber, previousRepairsList);
      document.getElementById('add-repair-button').style.display = 'inline-block';
    } else {
      deviceTypeInput.value = '';
      previousRepairsList.innerHTML = '';
      document.getElementById('add-repair-button').style.display = 'none';
    }
  });


  // app.js
addRepairButton.addEventListener('click', async () => {
  const repairSelect = document.createElement('select');
  repairSelect.required = true;
  repairSelect.classList.add('small');
  repairSelect.style.width = '550px';

  const deviceType = deviceTypeInput.value;
  const workTypes = await fetchWorkTypes(deviceType);
  const availableWorkTypes = workTypes.filter(work => !repairsToAdd.includes(work.id));

  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = '--';
  repairSelect.appendChild(emptyOption);

  availableWorkTypes.forEach(work => {
    const option = document.createElement('option');
    option.value = work.id;
    option.textContent = `${work.id}: ${work.price} грн`;
    repairSelect.appendChild(option);
  });

  const removeButton = document.createElement('button');
  removeButton.textContent = '-';
  removeButton.type = 'button';
  removeButton.classList.add('small');
  removeButton.style.width = '30px';

  removeButton.addEventListener('click', () => {
    repairListDiv.removeChild(repairItemDiv);
    repairsToAdd = repairsToAdd.filter(work => work !== repairSelect.value);
    updateTotalCost(deviceTypeInput, repairsToAdd, totalCostInput); // Обновляем общую стоимость
  });

  const repairItemDiv = document.createElement('div');
  repairItemDiv.classList.add('inline');
  repairItemDiv.appendChild(repairSelect);
  repairItemDiv.appendChild(removeButton);

  repairSelect.addEventListener('change', async () => {
    updateRepairsToAdd(repairSelect.value);
    await updateTotalCost(deviceTypeInput, repairsToAdd, totalCostInput); // Обновляем общую стоимость
  });

  repairListDiv.appendChild(repairItemDiv);
});


  function updateRepairsToAdd(selectedRepair) {
    const index = repairsToAdd.indexOf(selectedRepair);
    if (index === -1) {
      repairsToAdd.push(selectedRepair);
    } else {
      repairsToAdd[index] = selectedRepair;
    }
  }

  function highlightCompletedRepairs(repairRows, workTypeRows) {
    workTypeRows.forEach((workTypeRow) => {
      const workType = workTypeRow[1];
      const isCompleted = repairRows.some((repairRow) => repairRow[1].includes(workType));
      if (isCompleted) {
        workTypeRow.completed = true;
      }
    });
  }

  

  actForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const actNumber = document.getElementById('act-number').value;
    const deviceNumber = deviceNumberSelect.value;
    const repairDate = document.getElementById('repair-date').value;

    const repairData = {
      repair_id: actNumber,
      device_id: deviceNumber,
      repair_type: repairsToAdd.join(', '),
      work_count: repairsToAdd.length,
      installation_date: repairDate
    };

    try {
      const response = await fetch('/addRepair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(repairData)
      });
      if (response.ok) {
        alert('Акт успешно добавлен');
        clearForm();
        formContainer.style.display = 'none';
        menuPage.style.display = 'block';
      } else {
        alert('Ошибка при добавлении акта');
      }
    } catch (error) {
      console.error('Error adding repair:', error);
      alert('Ошибка при добавлении акта');
    }
  });

  document.getElementById('device-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const deviceNumber = document.getElementById('device-number').value;
    const deviceModel = document.getElementById('device-model').value;
    const factorySerialNumber = document.getElementById('factory-serial-number').value;
    const region = document.getElementById('region').value;

    const deviceData = {
      deviceNumber,
      deviceModel,
      factorySerialNumber,
      region
    };

    try {
      const response = await fetch('/addDevice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deviceData)
      });

      if (response.ok) {
        alert('Устройство успешно добавлено!');
        clearAddDeviceForm();
        addDeviceContainer.style.display = 'none';
        menuPage.style.display = 'block';
      } else {
        alert('Ошибка при добавлении устройства.');
      }
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Ошибка при добавлении устройства.');
    }
  });

  async function populateWorkTypes(deviceType) {
    try {
      if (!deviceType) {
        console.error('Device type is undefined');
        return;
      }
      console.log(`Fetching work types for device type: ${deviceType.toLowerCase()}`); // Логирование для проверки
      const response = await fetch(`/getWorkTypes/${deviceType.toLowerCase()}`);
      const workTypes = await response.json();
      console.log('Received work types:', workTypes); // Логирование для проверки
      const repairSelect = document.createElement('select');
      repairSelect.id = 'repair-select';
      repairSelect.required = true;
      repairSelect.classList.add('small');
      repairSelect.style.width = '550px';

      repairSelect.innerHTML = '';

      workTypes.forEach(workType => {
        const option = document.createElement('option');
        option.value = workType.id;
        option.textContent = `${workType.id} - ${workType.price} грн`; // Использование 'price' вместо 'cost'
        repairSelect.appendChild(option);
      });

      // Добавляем селект к DOM только если он был успешно заполнен
      const repairListDiv = document.getElementById('repair-list');
      if (repairListDiv) {
        repairListDiv.innerHTML = '';
        repairListDiv.appendChild(repairSelect);
      }
    } catch (error) {
      console.error('Error populating work types:', error);
    }
  }

  // Загрузка предыдущих ремонтов
  async function loadPreviousRepairs(deviceNumber, previousRepairsList) {
    const url = `/getPreviousRepairs/${deviceNumber}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch previous repairs: ${response.statusText}`);
      }
      const repairs = await response.json();
      previousRepairsList.innerHTML = '';
  
      if (repairs.length === 0) {
        previousRepairsList.innerHTML = '<tr><td colspan="3">Ремонтов за последние 6 месяцев не найдено</td></tr>';
      } else {
        repairs.forEach((repair, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${repair.repair_type}</td>
            <td>${repair.installation_date}</td>
          `;
          previousRepairsList.appendChild(row);
        });
      }
    } catch (error) {
      console.error('Error loading previous repairs:', error);
      previousRepairsList.innerHTML = '<tr><td colspan="3">Ошибка загрузки предыдущих ремонтов</td></tr>';
    }
  }
 
 
});
