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

  export async function updateTotalCost(deviceTypeInput, repairsToAdd, totalCostInput) {
    let totalCost = 0;
    for (const repairId of repairsToAdd) {
      const response = await fetch(`/getWorkTypes/${deviceTypeInput.value}`);
      const workTypes = await response.json();
      const workType = workTypes.find(wt => wt.id === repairId); // Знаходимо тип роботи за id
      if (workType) {
        totalCost += parseFloat(workType.price);
      } else {
        console.error(`Work type with id ${repairId} not found`);
      }
    }
    totalCostInput.value = `${totalCost} грн`;
  }
  export async function generateReport(month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
  
    try {
      const repairsRef = db.collection('Repairs')
        .where('installation_date', '>=', startDate.toISOString())
        .where('installation_date', '<=', endDate.toISOString());
      const snapshot = await repairsRef.get();
  
      const repairs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return repairs;
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Ошибка при формировании отчета.');
    }
  }
  
  module.exports = { generateReport };
   