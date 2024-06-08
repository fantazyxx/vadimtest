document.addEventListener('DOMContentLoaded', function () {
  // Кнопки меню
  const addActButton = document.getElementById('add-act-button');
  const searchDeviceButton = document.getElementById('search-device-button');
  const addDeviceButton = document.getElementById('add-device-button');

  // Контейнеры страниц
  const formContainer = document.getElementById('form-container');
  const formPage = document.getElementById('form-page');
  const searchContainer = document.getElementById('search-container');
  const searchPage = document.getElementById('search-page');
  const addDeviceContainer = document.getElementById('add-device-container');
  const addDevicePage = document.getElementById('add-device-page');
  const menuPage = document.getElementById('menu'); 

  // Кнопки "Назад"
  const backButton = document.getElementById('back-button');
  const searchBackButton = document.getElementById('search-back-button');
  const addDeviceBackButton = document.getElementById('add-device-back-button');

  // Другие элементы
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
    menuPage.classList.add('hidden');
    formContainer.classList.remove('hidden'); 
    searchContainer.classList.add('hidden'); // Скрываем другие контейнеры
    addDeviceContainer.classList.add('hidden'); 
    loadDeviceNumbers();
  });

  searchDeviceButton.addEventListener('click', () => {
    menuPage.classList.add('hidden');
    searchContainer.classList.remove('hidden');
    formContainer.classList.add('hidden'); // Скрываем другие контейнеры
    addDeviceContainer.classList.add('hidden'); 
  });

  addDeviceButton.addEventListener('click', () => {
    menuPage.classList.add('hidden');
    addDeviceContainer.classList.remove('hidden');
    formContainer.classList.add('hidden'); // Скрываем другие контейнеры
    searchContainer.classList.add('hidden'); 
  });

  backButton.addEventListener('click', () => {
    clearForm();
    menuPage.classList.remove('hidden');
    formContainer.classList.add('hidden');
    searchContainer.classList.add('hidden');
    addDeviceContainer.classList.add('hidden');
  });

  searchBackButton.addEventListener('click', () => {
    clearSearch();
    menuPage.classList.remove('hidden');
    formContainer.classList.add('hidden');
    searchContainer.classList.add('hidden');
    addDeviceContainer.classList.add('hidden');
  });

  addDeviceBackButton.addEventListener('click', () => {
    clearAddDeviceForm();
    menuPage.classList.remove('hidden');
    formContainer.classList.add('hidden');
    searchContainer.classList.add('hidden');
    addDeviceContainer.classList.add('hidden');
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
      alert('Ошибка при загрузке ремонтов.');
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

  // Функции для очистки форм
  function clearForm() {
    actForm.reset();
    deviceTypeInput.value = '';
    previousRepairsList.innerHTML = '';
    const repairItems = repairListDiv.querySelectorAll('.inline');
    repairItems.forEach(item => repairListDiv.removeChild(item));
    totalCostInput.value = '';
    repairsToAdd = [];
  }

  function clearSearch() {
    searchDeviceIdInput.value = '';
    searchResultsDiv.innerHTML = '';
  }

  function clearAddDeviceForm() {
    document.getElementById('device-form').reset();
  }

  // Обработчик формы добавления акта
  actForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const actNumber = document.getElementById('act-number').value;
    const deviceNumber = deviceNumberSelect.value;
    const repairDate = document.getElementById('repair-date').value;

    console.log('Act Number:', actNumber);
    console.log('Device Number:', deviceNumber);
    console.log('Repair Date:', repairDate);

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
        formPage.classList.add('hidden');
        menuPage.classList.remove('hidden');
      } else {
        alert('Ошибка при добавлении акта');
      }
    } catch (error) {
      console.error('Error adding repair:', error);
      alert('Ошибка при добавлении акта');
    }
  });

  // Обработчик формы добавления устройства
  document.getElementById('device-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const deviceNumber = document.getElementById('device-number').value;
    const deviceModel = document.getElementById('device-model').value;
    const factorySerialNumber = document.getElementById('factory-serial-number').value;
    const region = document.getElementById('region').value;

    console.log('Device Number:', deviceNumber);
    console.log('Device Model:', deviceModel);
    console.log('Factory Serial Number:', factorySerialNumber);
    console.log('Region:', region);

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
        addDevicePage.classList.add('hidden');
        menuPage.classList.remove('hidden');
      } else {
        alert('Ошибка при добавлении устройства.');
      }
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Ошибка при добавлении устройства.');
    }
  });
});

