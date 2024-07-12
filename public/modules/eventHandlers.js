// Обработчик для кнопки "Добавить Акт"
export function addActButtonClickHandler() {
    console.log('Add Act button clicked');
    menuPage.style.display = 'none';
    formContainer.style.display = 'block';
    loadDeviceNumbers(deviceNumberSelect);
  }
  
  // Обработчик для кнопки "Добавить Устройство"
  export function addDeviceButtonClickHandler() {
    console.log('Add Device button clicked');
    menuPage.style.display = 'none';
    addDeviceContainer.style.display = 'block';
  }
  
  // Обработчик для кнопки "Назад"
  export function backButtonClickHandler() {
    console.log('Back button clicked');
    clearForm(actForm, deviceTypeInput, previousRepairsList, repairListDiv, totalCostInput, repairsToAdd);
    formContainer.style.display = 'none';
    menuPage.style.display = 'block';
  }
  // Обработчик для кнопки "Назад" в форме поиска устройства
export function searchBackButtonClickHandler(searchDeviceIdInput, searchResultsDiv, searchContainer, menuPage) {
    console.log('Search Back button clicked');
    clearSearch(searchDeviceIdInput, searchResultsDiv);
    searchContainer.style.display = 'none';
    menuPage.style.display = 'block';
}

// Обработчик для кнопки "Назад" в форме добавления устройства
export function addDeviceBackButtonClickHandler(deviceForm, addDeviceContainer, menuPage) {
    console.log('Add Device Back button clicked');
    clearAddDeviceForm(deviceForm);
    addDeviceContainer.style.display = 'none';
    menuPage.style.display = 'block';
}