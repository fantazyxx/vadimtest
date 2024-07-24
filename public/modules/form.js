import { clearForm } from './utils.js';
// form.js
export async function handleSubmitActForm(event, actForm, deviceTypeInput, previousRepairsList, repairListDiv, totalCostInput, repairsToAdd, formContainer, menuPage, deviceNumberSelect ) {
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
        clearForm(actForm, deviceTypeInput, previousRepairsList, repairListDiv, totalCostInput, repairsToAdd);
        formContainer.style.display = 'none';
        menuPage.style.display = 'block';
      } else {
        alert('Ошибка при добавлении акта');
      }
    } catch (error) {
      console.error('Error adding repair:', error);
      alert('Ошибка при добавлении акта');
    }
  }
  