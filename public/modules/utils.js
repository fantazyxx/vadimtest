export function clearForm(actForm, deviceTypeInput, previousRepairsList, repairListDiv, totalCostInput, repairsToAdd) {
    actForm.reset();
    deviceTypeInput.value = '';
    previousRepairsList.innerHTML = '';
    const repairItems = repairListDiv.querySelectorAll('.inline');
    repairItems.forEach(item => repairListDiv.removeChild(item));
    totalCostInput.value = '';
    repairsToAdd = [];
  }