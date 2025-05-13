import { attachRowHover } from './uiUtils.js';

export function populateTables() {
  const currentTable = document.getElementById('current-projects-table');
  if (currentTable && currentTable.querySelector('tbody').childElementCount === 0) {
    const tbody = currentTable.querySelector('tbody');
    const sampleData = [
      { title: 'پروژه A', description: 'توضیحات پروژه A که ممکن است بسیار طولانی باشد و نیاز به خلاصه سازی داشته باشد', date: '2023/01/12' },
      { title: 'پروژه B', description: 'توضیحات پروژه B', date: '2023/01/15' },
      { title: 'پروژه C', description: 'توضیحات پروژه C', date: '2023/01/20' }
    ];
    sampleData.forEach(row => {
      const tr = document.createElement('tr');
      const tdTitle = document.createElement('td');
      const tdDesc = document.createElement('td');
      const tdDate = document.createElement('td');
      tdTitle.textContent = row.title;
      tdDesc.textContent = row.description.length > 20 ? row.description.substring(0, 20) + '...' : row.description;
      tdDate.textContent = row.date;
      tdTitle.setAttribute("data-fulltext", row.title);
      tdDesc.setAttribute("data-fulltext", row.description);
      tdDate.setAttribute("data-fulltext", row.date);
      tr.appendChild(tdTitle);
      tr.appendChild(tdDesc);
      tr.appendChild(tdDate);
      attachRowHover(tr);
      tbody.appendChild(tr);
    });
  }
}
