import { attachRowHover, animateRdRows } from './uiUtils.js';




export function setupCSVLoading() {
  const csvFiles = [
    { url: 'data/projects_curr.csv', targetId: 'current-projects-table' },
    { url: 'data/projects_Future.csv', targetId: 'future-projects-table' },
    { url: 'data/service_equipments.csv', targetId: 'service-equipment-table' },
    { url: 'data/calib_equipments.csv', targetId: 'calibration-equipment-table' },
    { url: 'data/Res_Dev_projects.csv', targetId: 'rd-info' }
  ];
  csvFiles.forEach(file => {
    fetch(file.url)
      .then(response => response.text())
      .then(text => parseCSV(text, file.targetId))
      .catch(error => {
        console.error("Error loading CSV:", error);
        const element = document.getElementById(file.targetId);
        if (element) {
          if (element.tagName.toLowerCase() === 'table') {
            const tbody = element.querySelector('tbody');
            tbody.innerHTML = `<tr><td colspan="5">خطا در بارگذاری داده‌ها.</td></tr>`;
          } else {
            element.innerHTML = `<p>خطا در بارگذاری داده‌ها.</p>`;
          }
        }
      });
  });
}

function parseCSV(text, targetId) {
  Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const element = document.getElementById(targetId);
      if (!element) return;
      if (element.tagName.toLowerCase() === 'table') {
        populateTableWithCSVData(results.data, targetId, results.meta.fields);
      } else {
        updateRdInfo(results.data);
      }
    },
    error: function (err) {
      console.error("CSV Parsing error:", err);
    }
  });
}

function populateTableWithCSVData(data, tableId, fields) {
  const table = document.getElementById(tableId);
  if (!table) return;
  // Update header using CSV metadata.
  if (fields && fields.length > 0) {
    const thead = table.querySelector('thead') || document.createElement('thead');
    thead.innerHTML = "";
    const tr = document.createElement("tr");
    fields.forEach(field => {
      const th = document.createElement("th");
      th.textContent = field;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    if (!table.querySelector('thead')) table.insertBefore(thead, table.firstChild);
  }
  // Populate tbody.
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement('tr');
    fields.forEach(field => {
      const td = document.createElement('td');
      const cellValue = row[field] ? row[field] : "";
      const truncated = cellValue.length > 20 ? cellValue.substring(0, 20) + "..." : cellValue;
      td.textContent = truncated;
      td.setAttribute("data-fulltext", cellValue);
      tr.appendChild(td);
    });
    // Row highlighting based on date:
    let highlight = "";
    let dateFieldIndex = fields.findIndex(f => f.toLowerCase().includes("date"));
    if (dateFieldIndex === -1) {
      dateFieldIndex = fields.findIndex(f => f.includes("تاریخ"));
    }
    if (dateFieldIndex === -1) {
      dateFieldIndex = fields.findIndex(f => f.includes("کالیبراسیون"));
    }
    if (dateFieldIndex !== -1) {
      let dateStr = row[fields[dateFieldIndex]];
      let rowDate = new Date(dateStr);
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

function updateRdInfo(data) {
  const rdInfoEl = document.getElementById('rd-info');
  // Create an array of row texts.
  const rows = data.map(row => {
    return row.description ? row.description : Object.values(row).join(" | ");
  });
  rdInfoEl.textContent = "";
  // Animate rows one by one.
  // We call animateRdRows from uiUtils.js.
  // Note: We assume that animateRdRows is imported in uiUtils.js.
  animateRdRows(rows, rdInfoEl);
}

export function fetchCSV(url, callback) {
  fetch(url)
    .then(response => response.text())
    .then(text => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          callback(results.data);
        }
      });
    })
    .catch(error => console.error("Error loading CSV:", error));
}