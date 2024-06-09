// utils.js

export function createTable(headers, rows) {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.fontSize = '10pt';  // Уменьшение размера шрифта
    table.style.borderCollapse = 'collapse';
  
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      th.style.border = '1px solid black';
      th.style.padding = '8px';
      th.style.textAlign = 'left';
      th.style.whiteSpace = 'nowrap';  // Предотвращение переноса слов
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
  
    const tbody = document.createElement('tbody');
    rows.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        td.style.border = '1px solid black';
        td.style.padding = '8px';
        td.style.whiteSpace = 'nowrap';  // Предотвращение переноса слов
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  
    return table;
  }
  