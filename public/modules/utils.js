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
  export function clearAddDeviceForm(deviceForm) {
    deviceForm.reset();
  }

  export function updateRepairsToAdd(selectedRepair, repairsToAdd) {
    const index = repairsToAdd.indexOf(selectedRepair);
    if (index === -1) {
      repairsToAdd.push(selectedRepair);
    } else {
      repairsToAdd.splice(index, 1); // Видаляємо елемент за індексом
    }
    return repairsToAdd; // Повертаємо оновлений масив
  }
  export function populateRegionSelect(regionSelect, uniqueRegions) {
    regionSelect.innerHTML = '<option value="">--</option>';
    uniqueRegions.forEach(region => {
      const option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });
  }