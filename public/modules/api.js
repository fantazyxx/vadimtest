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

  export async function loadDeviceType(deviceNumber) {
    try {
      const response = await fetch(`/getDevice/${deviceNumber}`);
      const device = await response.json();
      deviceTypeInput.value = device.data.model;
      return device.data.model; // Возвращаем значение deviceType
    } catch (error) {
      console.error('Error fetching device type:', error);
    }
  }