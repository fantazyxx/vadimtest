export async function loadDeviceNumbers(deviceNumberSelect) {
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

  export async function loadDeviceType(deviceNumber, deviceTypeInput) { // Додано deviceTypeInput
    try {
      const response = await fetch(`/getDevice/${deviceNumber}`);
      const device = await response.json();
      deviceTypeInput.value = device.data.model; // Тепер використовуємо переданий елемент
      return device.data.model;
    } catch (error) {
      console.error('Error fetching device type:', error);
    }
  }

  export async function fetchWorkTypes(deviceType) {
    try {
      const response = await fetch(`/getWorkTypes/${deviceType}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching work types:', error);
      return [];
    }
  }