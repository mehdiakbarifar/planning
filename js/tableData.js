import { attachRowHover } from './uiUtils.js';

export function populateTables() {
  const currentTable = document.getElementById('current-projects-table');
  if (currentTable && currentTable.querySelector('tbody').childElementCount === 0) {
    const tbody = currentTable.querySelector('tbody');
    // Updated sampleData with a "Client" field and a date for coloring
    const sampleData = [
      { title: 'Project A', description: 'Description A that might need truncating if too long', date: '2023/01/12', Client: 'Acme Inc.' },
      { title: 'Project B', description: 'Description B', date: '2023/12/15', Client: '' },  // Blank will be shown as "Other"
      { title: 'Project C', description: 'Description C', date: '2023/11/20', Client: 'Beta LLC' }
    ];
    // Create a header if it doesn't exist
    let thead = currentTable.querySelector('thead');
    if (!thead) {
      thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const headers = ['Title', 'Description', 'Date', 'Client'];
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      currentTable.insertBefore(thead, tbody);
    }
    // Populate rows and apply date-based coloring
    sampleData.forEach(row => {
      const tr = document.createElement('tr');
      const tdTitle = document.createElement('td');
      const tdDesc = document.createElement('td');
      const tdDate = document.createElement('td');
      const tdClient = document.createElement('td');
      tdTitle.textContent = row.title;
      tdDesc.textContent = row.description.length > 20 ? row.description.substring(0, 20) + '...' : row.description;
      tdDate.textContent = row.date;
      tdClient.textContent = row.Client.trim() === "" ? "Other" : row.Client;
      
      tdTitle.setAttribute("data-fulltext", row.title);
      tdDesc.setAttribute("data-fulltext", row.description);
      tdDate.setAttribute("data-fulltext", row.date);
      tdClient.setAttribute("data-fulltext", row.Client.trim() === "" ? "Other" : row.Client);
      
      tr.appendChild(tdTitle);
      tr.appendChild(tdDesc);
      tr.appendChild(tdDate);
      tr.appendChild(tdClient);
      
      // --- Date Highlighting Logic ---
      let highlight = "";
      // Assuming the date is in the "Date" column (3rd column, index 2)
      if(row.date) {
        let rowDate = new Date(row.date);
        let now = new Date();
        if (!isNaN(rowDate)) {
          if (rowDate < now) {
            highlight = "highlight-red";
          } else if (rowDate - now <= 30 * 24 * 60 * 60 * 1000) {
            highlight = "highlight-yellow";
          }
        }
      }
      if (highlight) {
        tr.classList.add(highlight);
      }
      
      attachRowHover(tr);
      tbody.appendChild(tr);
    });
  }
}
