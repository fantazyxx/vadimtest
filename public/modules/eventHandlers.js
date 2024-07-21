import { loadDeviceNumbers, generateReport } from './api.js';
import { clearForm, clearSearch, clearAddDeviceForm } from './utils.js';
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

  // Вставьте в начало файла, чтобы добавить новые функции обработчиков
export function generateReportButtonClickHandler(menuPage, reportContainer) {
  menuPage.style.display = 'none';
  reportContainer.style.display = 'block';
}

export function reportBackButtonClickHandler(reportContainer, menuPage) {
  reportContainer.style.display = 'none';
  menuPage.style.display = 'block';
}

export async function reportFormSubmitHandler(event, reportContainer, menuPage) {
  event.preventDefault();

  const month = document.getElementById('report-month').value;
  const year = document.getElementById('report-year').value;

  try {
    const repairs = await generateReport(month, year);
    displayReport(repairs);
    reportContainer.style.display = 'none';
    menuPage.style.display = 'block';
  } catch (error) {
    console.error('Error generating report:', error);
    alert('Ошибка при формировании отчета.');
  }
}

