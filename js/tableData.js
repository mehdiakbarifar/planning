import { attachRowHover } from './uiUtils.js';

export function populateTables() {
  // Add search bars above tables for easier filtering.
  ["current-projects-table", "future-projects-table", "service-equipment-table", "calibration-equipment-table"].forEach(addSearchBar);
  
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

function addSearchBar(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  // Check if the table is inside a container with class 'scrollable-table'
  let container = table.parentElement;
  if (container.classList.contains("scrollable-table")) {
    const searchContainer = document.createElement("div");
    searchContainer.style.marginBottom = "6px";
    searchContainer.style.padding = "5px";
    searchContainer.style.backgroundColor = "#f5f5f5";
    searchContainer.style.border = "1px solid #ddd";
    
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "جستجو...";
    searchInput.style.padding = "5px";
    searchInput.style.width = "90%";

    searchContainer.appendChild(searchInput);
    // Insert the search container above the scrollable table container so it’s always visible
    container.parentElement.insertBefore(searchContainer, container);

    searchInput.addEventListener("input", function () {
      filterTableRows(tableId, searchInput.value);
    });
  } else {
    // Fallback: insert search bar before the table element
    const searchContainer = document.createElement("div");
    searchContainer.style.marginBottom = "6px";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "جستجو...";
    searchInput.style.padding = "5px";
    searchInput.style.width = "90%";

    searchContainer.appendChild(searchInput);
    table.parentElement.insertBefore(searchContainer, table);

    searchInput.addEventListener("input", function () {
      filterTableRows(tableId, searchInput.value);
    });
  }
}

function filterTableRows(tableId, query) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = table.querySelectorAll("tbody tr");
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(query.toLowerCase()) ? "" : "none";
  });
}
