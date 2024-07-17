import { loadDeviceNumbers } from './api.js';
import { clearForm } from './utils.js';
import { searchDeviceRepairs } from './search.js';

// Обработчик для кнопки "Внести Акт"
export function addActButtonClickHandler(formContainer, menuPage, deviceNumberSelect) {
    console.log('Add Act button clicked');
    menuPage.style.display = 'none';
    formContainer.style.display = 'block';
    loadDeviceNumbers(deviceNumberSelect);
  }
  
  // Обработчик для кнопки "Добавить Устройство"
  export function addDeviceButtonClickHandler(menuPage, addDeviceContainer) {
    console.log('Add Device button clicked');
    menuPage.style.display = 'none';
    addDeviceContainer.style.display = 'block';
  }
  
  // Обработчик для кнопки "Назад"
  export function backButtonClickHandler(actForm, deviceTypeInput, previousRepairsList, repairListDiv, totalCostInput, repairsToAdd, formContainer, menuPage) {
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

// Обработчик для кнопки "Поиск устройства"
export function searchDeviceButtonClickHandler(menuPage, searchContainer) {
    console.log('Search Device button clicked');
    menuPage.style.display = 'none';
    searchContainer.style.display = 'block';
  }
  
  // Обработчик для кнопки "Поиск"
  export function searchButtonClickHandler(searchDeviceIdInput, searchResultsDiv, searchDeviceRepairs) {
    const deviceId = searchDeviceIdInput.value;
    if (deviceId) {
      searchDeviceRepairs(deviceId, searchResultsDiv);
    }
  }
  export function clearSearch() {
    const searchResultsDiv = document.getElementById('search-results');
    searchResultsDiv.innerHTML = '';
    const searchForm = document.getElementById('search-form');
    searchForm.reset(); // Сбрасываем форму поиска, если это необходимо
  }