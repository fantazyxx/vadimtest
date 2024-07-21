import { loadDeviceNumbers, loadDeviceType, fetchWorkTypes, updateTotalCost, generateReport } from './modules/api.js';
import { clearForm, clearSearch, clearAddDeviceForm, updateRepairsToAdd, populateRegionSelect, createTable } from './modules/utils.js';
import { addActButtonClickHandler, addDeviceButtonClickHandler, backButtonClickHandler, searchBackButtonClickHandler, addDeviceBackButtonClickHandler, searchDeviceButtonClickHandler, searchButtonClickHandler } from './modules/eventHandlers.js';
import { generateReportButtonClickHandler, reportBackButtonClickHandler, reportFormSubmitHandler } from './modules/eventHandlers.js';
import { searchDeviceRepairs } from './modules/search.js';
import { handleSubmitActForm } from './modules/form.js';
import { initializeApp, db } from './modules/firebase.js';

// Other imports and code


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
  const deviceTypeSelect = document.getElementById('device-type');
  const deviceModelSelect = document.getElementById('device-model');
  const deviceForm = document.getElementById('device-form');
  const generateReportButton = document.getElementById('generate-report-button');
  const reportBackButton = document.getElementById('report-back-button');
  const reportForm = document.getElementById('report-form');
  const reportContainer = document.getElementById('report-container');

  searchDeviceIdInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchButton.click();
    }
  });

  searchDeviceIdInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchButton.click();
    }
  });

  addActButton.addEventListener('click', () => addActButtonClickHandler(formContainer, menuPage, deviceNumberSelect));
  addDeviceButton.addEventListener('click', () => addDeviceButtonClickHandler(menuPage, addDeviceContainer));
  backButton.addEventListener('click', () => backButtonClickHandler(actForm, deviceTypeInput, previousRepairsList, repairListDiv, totalCostInput, repairsToAdd, formContainer, menuPage));
  searchBackButton.addEventListener('click', () => searchBackButtonClickHandler(searchDeviceIdInput, searchResultsDiv, searchContainer, menuPage));
  addDeviceBackButton.addEventListener('click', () => addDeviceBackButtonClickHandler(deviceForm, addDeviceContainer, menuPage));
  searchDeviceButton.addEventListener('click', () => searchDeviceButtonClickHandler(menuPage, searchContainer));
  searchButton.addEventListener('click', () => searchButtonClickHandler(searchDeviceIdInput, searchResultsDiv, searchDeviceRepairs));
  generateReportButton.addEventListener('click', () => generateReportButtonClickHandler(menuPage, reportContainer));
  reportBackButton.addEventListener('click', () => reportBackButtonClickHandler(reportContainer, menuPage));
  reportForm.addEventListener('submit', (event) => reportFormSubmitHandler(event, reportContainer, menuPage));
  
  deviceTypeSelect.addEventListener('change', () => {
    const selectedType = deviceTypeSelect.value;
    let models = [];

    switch (selectedType) {
      case 'Безвакуумный/ленточный упаковщик':
        models = ['una_001'];
        break;
      case 'Счетчик монет':
        models = ['scancoin_sc350', 'scancoin_sc303', 'scancoin_sc313'];
        break;
      case 'Вакуумный упаковщик':
        models = ['deep2240', 'deep2241', 'docash2241', 'vamabp2'];
        break;
      case 'Детектор валют':
        models = ['mt'];
        break;
    }

    deviceModelSelect.innerHTML = '<option value="">--</option>'; // Сбросить предыдущие опции
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      deviceModelSelect.appendChild(option);
    });
  });
  const regionSelect = document.getElementById('region');

  let repairsToAdd = [];
  let totalCost = 0;

  const uniqueRegions = [
    "Тернопіль", "Чернігів", "Прилуки", "Черкаси", "Чернівці", "Дніпро", "Закарпаття",
    "Рівне", "Харків", "Херсон", "Хмельницький", "Івано Франківськ", "Київ", "Кіровоград",
    "Кривий ріг", "Львів", "Миколаїв", "Одеса", "Полтава", "Кременчуг", "Суми", "Волинь", "Вінниця", "Запоріжжя"
  ];

  populateRegionSelect(regionSelect, uniqueRegions);
  
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
      repairsToAdd = updateRepairsToAdd(repairSelect.value, repairsToAdd); // Присвоюємо результат функції
      await updateTotalCost(deviceTypeInput, repairsToAdd, totalCostInput);
    });
  
    repairListDiv.appendChild(repairItemDiv);
  });


   function highlightCompletedRepairs(repairRows, workTypeRows) {
    workTypeRows.forEach((workTypeRow) => {
      const workType = workTypeRow[1];
      const isCompleted = repairRows.some((repairRow) => repairRow[1].includes(workType));
      if (isCompleted) {
        workTypeRow.completed = true;
      }
    });
  }

  actForm.addEventListener('submit', (event) => handleSubmitActForm(event, actForm, deviceTypeInput, previousRepairsList, repairListDiv, totalCostInput, repairsToAdd, formContainer, menuPage));

  document.getElementById('device-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const deviceNumber = document.getElementById('device-number').value;
    const deviceType = document.getElementById('device-type').value;
    const deviceModel = document.getElementById('device-model').value;
    const factorySerialNumber = document.getElementById('factory-serial-number').value;
    const region = document.getElementById('region').value;

    const deviceData = {
      deviceNumber,
      deviceModel,
      factorySerialNumber,
      region,
      deviceType
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
