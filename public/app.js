document.addEventListener('DOMContentLoaded', function() {
  const addActButton = document.getElementById('add-act-button');
  const searchDeviceButton = document.getElementById('search-device-button');
  const addDeviceButton = document.getElementById('add-device-button');
  const formPage = document.getElementById('form-page');
  const menuPage = document.getElementById('menu');
  const searchPage = document.getElementById('search-page');
  const addDevicePage = document.getElementById('add-device-page');
  const backButton = document.getElementById('back-button');
  const searchBackButton = document.getElementById('search-back-button');
  const addDeviceBackButton = document.getElementById('add-device-back-button');
  const searchButton = document.getElementById('search-button');
  const actForm = document.getElementById('act-form');
  const deviceNumberSelect = document.getElementById('device-number-select');
  const deviceTypeInput = document.getElementById('device-type-input');
  const previousRepairsList = document.getElementById('previous-repairs');
  const addRepairButton = document.getElementById('add-repair-button');
  const repairListDiv = document.getElementById('repair-list');
  const totalCostInput = document.getElementById('total-cost');
  const searchDeviceIdInput = document.getElementById('search-device-id');
  const searchResultsDiv = document.getElementById('search-results');
  const regionSelect = document.getElementById('region');
  const addRepairLabel = document.getElementById('add-repair-label');

  let repairsToAdd = [];
  let totalCost = 0;

  // Уникальные регионы
  const uniqueRegions = [
    "Тернопіль", "Чернігів", "Прилуки", "Черкаси", "Чернівці", "Дніпро", "Закарпаття",
    "Рівне", "Харків", "Херсон", "Хмельницький", "Івано Франківськ", "Київ", "Кіровоград",
    "Кривий ріг", "Львів", "Миколаїв", "Одеса", "Полтава", "Кременчуг", "Суми", "Волинь", "Вінниця", "Запоріжжя"
  ];

  // Заполнение выпадающего списка регионов
  function populateRegionSelect() {
    regionSelect.innerHTML = '<option value="">--</option>'; // Опция по умолчанию
    uniqueRegions.forEach(region => {
      const option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });
  }

  populateRegionSelect(); // Вызов функции для заполнения при загрузке страницы

  function resetFormDisplay() {
    addRepairLabel.style.display = 'block';
    addRepairButton.style.display = 'block';
  }

  function resetButtonsSpacing() {
    const buttons = [addActButton, searchDeviceButton, addDeviceButton];
    buttons.forEach(button => {
      button.style.marginRight = '10px';
    });
  }

  addActButton.addEventListener('click', () => {
    menuPage.style.display = 'none';
    formPage.style.display = 'block';
    resetFormDisplay();
    loadDeviceNumbers();
  });

  searchDeviceButton.addEventListener('click', () => {
    menuPage.style.display = 'none';
    searchPage.style.display = 'block';
  });

  addDeviceButton.addEventListener('click', () => {
    menuPage.style.display = 'none';
    addDevicePage.style.display = 'block';
  });

  backButton.addEventListener('click', () => {
    clearForm();
    formPage.style.display = 'none';
    menuPage.style.display = 'block';
    resetButtonsSpacing();
  });

  searchBackButton.addEventListener('click', () => {
    clearSearch();
    searchPage.style.display = 'none';
    menuPage.style.display = 'block';
    resetButtonsSpacing();
  });

  addDeviceBackButton.addEventListener('click', () => {
    clearAddDeviceForm();
    addDevicePage.style.display = 'none';
    menuPage.style.display = 'block';
    resetButtonsSpacing();
  });

  searchButton.addEventListener('click', async () => {
    const deviceId = searchDeviceIdInput.value;
    if (deviceId) {
      await searchDeviceRepairs(deviceId);
    }
  });

  deviceNumberSelect.addEventListener('change', async () => {
    const deviceNumber = deviceNumberSelect.value;
    if (deviceNumber) {
      await loadDeviceType(deviceNumber);
      await loadPreviousRepairs(deviceNumber);
    } else {
      deviceTypeInput.value = '';
      previousRepairsList.innerHTML = '';
    }
  });

  addRepairButton.addEventListener('click', async () => {
    const repairSelect = document.createElement('select');
    repairSelect.required = true;
    repairSelect.classList.add('small');
    repairSelect.style.width = '550px';

    const workTypes = await fetchWorkTypes();
    const availableWorkTypes = workTypes.filter(work => !repairsToAdd.includes(work.id));

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '--';
    repairSelect.appendChild(emptyOption);

    availableWorkTypes.forEach(work => {
      const option = document.createElement('option');
      option.value = work.id;
      option.textContent = `${work.id}: ${work.data.cost} грн`;
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
      updateTotalCost();
    });

    const repairItemDiv = document.createElement('div');
    repairItemDiv.classList.add('inline');
    repairItemDiv.appendChild(repairSelect);
    repairItemDiv.appendChild(removeButton);

    repairSelect.addEventListener('change', () => {
      updateRepairsToAdd(repairSelect.value);
      updateTotalCost();
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

  async function loadDeviceNumbers() {
    try {
      const response = await fetch('/getDevices');
      const devices = await response.json();
      deviceNumberSelect.innerHTML = '<option value="">--</option>';
      devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.id;
        option.textContent = device.id;
        deviceNumberSelect.appendChild(option);
      });
      deviceNumberSelect.style.width = '550px';
    } catch (error) {
      console.error('Error fetching device numbers:', error);
    }
  }

  async function loadDeviceType(deviceNumber) {
    try {
      const response = await fetch(`/getDevice/${deviceNumber}`);
      const device = await response.json();
      deviceTypeInput.value = device.data.model;
    } catch (error) {
      console.error('Error fetching device type:', error);
    }
  }

  async function loadPreviousRepairs(deviceNumber) {
    try {
      const response = await fetch('/getRepairs');
      const repairs = await response.json();
      previousRepairsList.innerHTML = '';
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      repairs.filter(repair => repair.data.device_id === deviceNumber && new Date(repair.data.installation_date) >= sixMonthsAgo).forEach(repair => {
        const listItem = document.createElement('li');
        listItem.textContent = `${repair.data.repair_type}, Дата: ${repair.data.installation_date}`;
        previousRepairsList.appendChild(listItem);
      });
    } catch (error) {
      console.error('Error fetching previous repairs:', error);
    }
  }

  async function fetchWorkTypes() {
    try {
      const response = await fetch('/getWorkTypes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching work types:', error);
      return [];
    }
  }

  async function updateTotalCost() {
    totalCost = 0;
    for (const repair of repairsToAdd) {
      const response = await fetch(`/getWorkType/${repair}`);
      const workType = await response.json();
      totalCost += workType.data.cost;
    }
    totalCostInput.value = `${totalCost} грн`;
  }

  async function searchDeviceRepairs(deviceId) {
    try {
      const response = await fetch('/getRepairs');
      const repairs = await response.json();
      searchResultsDiv.innerHTML = '';
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      repairs.filter(repair => repair.data.device_id === deviceId && new Date(repair.data.installation_date) >= sixMonthsAgo).forEach(repair => {
        const repairType = document.createElement('div');
        repairType.textContent = repair.data.repair_type;
        const repairDate = document.createElement('div');
        repairDate.textContent = repair.data.installation_date;
        const resultRow = document.createElement('div');
        resultRow.classList.add('inline');
        resultRow.appendChild(repairType);
        resultRow.appendChild(repairDate);
        searchResultsDiv.appendChild(resultRow);
      });
    } catch (error) {
      console.error('Error fetching repairs:', error);
      alert('Ошибка при загрузке ремонтов.');
    }
  }

  function clearForm() {
    actForm.reset();
    deviceTypeInput.value = '';
    previousRepairsList.innerHTML = '';
    repairListDiv.innerHTML = '';
    totalCostInput.value = '';
    repairsToAdd = [];
    resetFormDisplay();
  }

  function clearSearch() {
    searchDeviceIdInput.value = '';
    searchResultsDiv.innerHTML = '';
  }

  function clearAddDeviceForm() {
    document.getElementById('device-form').reset();
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
        formPage.style.display = 'none';
        menuPage.style.display = 'block';
        resetButtonsSpacing();
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
    const deviceType = document.getElementById('device-type').value;

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
        addDevicePage.style.display = 'none';
        menuPage.style.display = 'block';
        resetButtonsSpacing();
      } else {
        alert('Ошибка при добавлении устройства.');
      }
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Ошибка при добавлении устройства.');
    }
  });

});
