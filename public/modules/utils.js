export function clearForm(actForm, deviceTypeInput, previousRepairsList, repairListDiv, totalCostInput, repairsToAdd) {
    actForm.reset();
    deviceTypeInput.value = '';
    previousRepairsList.innerHTML = '';
    const repairItems = repairListDiv.querySelectorAll('.inline');
    repairItems.forEach(item => repairListDiv.removeChild(item));
    totalCostInput.value = '';
    repairsToAdd = [];
  }
  export function clearSearch() {
    searchDeviceIdInput.value = '';
    searchResultsDiv.innerHTML = '';
  }
  export function clearAddDeviceForm() {
    document.getElementById('device-form').reset();
  }