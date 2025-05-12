document.addEventListener('DOMContentLoaded', () => {
  /* ------------------ Theme Switching ------------------ */
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const newTheme = option.getAttribute('data-theme');
      // Clear any existing theme classes and add new one (prefix with "theme-")
      document.body.className = "";
      document.body.classList.add("theme-" + newTheme);
    });
  });

  /* ------------------ Digital Clock & Date ------------------ */
  function updateDigitalClock() {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const ss = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('time').textContent = `${hh}:${mm}:${ss}`;
    // Use toLocaleDateString with Persian locale, and let the CSS handle RTL text
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date').textContent = now.toLocaleDateString('fa-IR', options);
  }
  updateDigitalClock();
  setInterval(updateDigitalClock, 1000);

  /* ------------------ Auto-Scroll Utility ------------------ */
  function autoScroll(containerId, intervalTime) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let intervalId;
    function startScrolling() {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (container.matches(':hover')) return;
        let currentScroll = container.scrollTop;
        let newScroll = currentScroll + 1;
        if (newScroll > container.scrollHeight - container.clientHeight) {
          newScroll = 0;
        }
        container.scrollTo({ top: newScroll, behavior: 'smooth' });
      }, intervalTime);
    }
    container.addEventListener('mouseenter', () => clearInterval(intervalId));
    container.addEventListener('mouseleave', startScrolling);
    startScrolling();
  }

  /* ------------------ CSV Loader using PapaParse (ensuring UTF-8) ------------------ */
  function loadCSV(file, callback) {
    fetch(file)
      .then(response => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        // Read as blob to force proper UTF-8 decoding
        return response.blob();
      })
      .then(blob => blob.text())
      .then(text => {
        const data = Papa.parse(text, { header: false }).data;
        if (!data || data.length === 0) {
          console.error("CSV file is empty: " + file);
        }
        callback(data);
      })
      .catch(error => console.error("Error loading CSV: " + file, error));
  }

  /* ------------------ Populate Table ------------------ */
  function populateTableFixed(headId, bodyId, data) {
    if (!data || data.length < 2) {
      document.getElementById(headId).innerHTML = `<tr><th colspan="8" style="text-align:center;">عنوان</th></tr>`;
      document.getElementById(bodyId).innerHTML = `<tr><td colspan="8" style="text-align:center;">هیچ داده‌ای موجود نیست</td></tr>`;
      return;
    }
    const headElem = document.getElementById(headId);
    const bodyElem = document.getElementById(bodyId);
    let truncatedHeader = "<tr>";
    data[0].slice(0, 8).forEach(cell => {
      truncatedHeader += `<th>${cell}</th>`;
    });
    truncatedHeader += "</tr>";
    headElem.innerHTML = truncatedHeader;
    
    const table = headElem.closest("table");
    let fullHeader = "<tr>";
    data[0].forEach(cell => { fullHeader += `<th>${cell}</th>`; });
    fullHeader += "</tr>";
    table.dataset.fullHeader = fullHeader;
    
    let bodyHTML = "";
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.some(cell => cell.trim() !== "")) {
        bodyHTML += "<tr>";
        row.forEach((cell, index) => {
          if (index < 8)
            bodyHTML += `<td><div class="cell-content">${cell}</div></td>`;
          else
            bodyHTML += `<td class="extra"><div class="cell-content">${cell}</div></td>`;
        });
        bodyHTML += "</tr>";
      }
    }
    if (!bodyHTML) {
      bodyHTML = `<tr><td colspan="8" style="text-align:center;">هیچ داده‌ای موجود نیست</td></tr>`;
    }
    bodyElem.innerHTML = bodyHTML;
    setupRowHover(bodyElem);
  }
  
  function populateTableSimple(tableId, data) {
    const table = document.getElementById(tableId);
    let html = "";
    data.forEach(row => {
      if (row.some(cell => cell.trim() !== "")) {
        html += "<tr>";
        row.forEach((cell, index) => {
          if (index < 8)
            html += `<td><div class="cell-content">${cell}</div></td>`;
          else
            html += `<td class="extra"><div class="cell-content">${cell}</div></td>`;
        });
        html += "</tr>";
      }
    });
    if (!html) {
      html = `<tr><td colspan="8" style="text-align:center;">هیچ داده‌ای موجود نیست</td></tr>`;
    }
    table.innerHTML = html;
    setupRowHover(table);
  }

  /* ------------------ Setup Row Hover & Overlay Clone ------------------ */
  function setupRowHover(tbody) {
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        row.classList.add('hovered');
        showRowClone(row);
      });
      row.addEventListener('mouseleave', () => {
        row.classList.remove('hovered');
        hideRowClone();
      });
    });
  }
  
  function showRowClone(row) {
    const table = row.closest("table");
    if (!table) return;
    let cloneHeader = null;
    if (table.dataset.fullHeader) {
      cloneHeader = document.createElement("thead");
      cloneHeader.innerHTML = table.dataset.fullHeader;
    }
    const clonedRow = row.cloneNode(true);
    const cloneTable = document.createElement("table");
    cloneTable.classList.add("hover-clone-table");
    if (cloneHeader) {
      cloneTable.appendChild(cloneHeader);
    }
    cloneTable.appendChild(clonedRow);
    
    const rect = row.getBoundingClientRect();
    let headerHeight = 0;
    if (cloneHeader) {
      cloneTable.style.visibility = "hidden";
      document.body.appendChild(cloneTable);
      headerHeight = cloneHeader.getBoundingClientRect().height;
      cloneTable.remove();
      cloneTable.style.visibility = "";
    }
    cloneTable.style.position = "absolute";
    cloneTable.style.top = (rect.top - headerHeight) + "px";
    cloneTable.style.left = rect.left + "px";
    cloneTable.style.width = rect.width + "px";
    cloneTable.style.zIndex = "2000";
    
    hideRowClone();
    cloneTable.id = "row-clone";
    document.getElementById("overlay").appendChild(cloneTable);
  }
  
  function hideRowClone() {
    const existing = document.getElementById("row-clone");
    if (existing) {
      existing.remove();
    }
  }
  
  /* ------------------ Count Project Statuses ------------------ */
  function countProjectStatuses(data) {
    const header = data[0];
    let statusIndex = header.findIndex(col => col.toLowerCase() === "status");
    if (statusIndex === -1) {
      console.warn('ستون "status" یافت نشد. همه رکوردها به عنوان خالی در نظر گرفته می‌شوند.');
      statusIndex = -1;
    }
    let completed = 0, repair = 0, blank = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let status = (statusIndex !== -1 && row[statusIndex]) ? row[statusIndex].trim().toLowerCase() : "";
      if (status === "completed") { completed++; }
      else if (status === "repair") { repair++; }
      else { blank++; }
    }
    return { completed, repair, blank };
  }
  
  /* ------------------ Count SOW Categories ------------------ */
  function countProjectSOW(data) {
    const header = data[0];
    let sowIndex = header.findIndex(col => col.toLowerCase() === "sow");
    if (sowIndex === -1) {
      console.warn('ستون "sow" یافت نشد. همه رکوردها به عنوان Other در نظر گرفته می‌شوند.');
      sowIndex = -1;
    }
    let cleaning = 0, inspection = 0, repair = 0, other = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let sowText = (sowIndex !== -1 && row[sowIndex]) ? row[sowIndex].trim().toLowerCase() : "";
      if (sowText.includes("repair") || sowText.includes("coating") || sowText.includes("heat")) {
        repair++;
      } else if (sowText.includes("inspect") || sowText.includes("fpi")) {
        inspection++;
      } else if (sowText.includes("clean") || sowText.includes("sand")) {
        cleaning++;
      } else {
        other++;
      }
    }
    return { cleaning, inspection, repair, other };
  }
  
  /* ------------------ Chart Functions ------------------ */
  function updatePieChart() {
    const ctx = document.getElementById('pieChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Completed', 'Repair', 'Blank'],
        datasets: [{
          data: [projectStatusCounts.completed, projectStatusCounts.repair, projectStatusCounts.blank],
          backgroundColor: ['#4CAF50', '#FF5722', '#9E9E9E']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            align: 'start',
            labels: { font: { size: 10 }, color: '#fff' }
          }
        }
      }
    });
  }
  
  function updateSOWPieChart() {
    const ctx = document.getElementById('sowPieChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Cleaning', 'Inspection', 'Repair', 'Other'],
        datasets: [{
          data: [sowCounts.cleaning, sowCounts.inspection, sowCounts.repair, sowCounts.other],
          backgroundColor: ['#8BC34A', '#00BCD4', '#FF5722', '#9E9E9E']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            align: 'start',
            labels: { font: { size: 10 }, color: '#fff' }
          }
        }
      }
    });
  }
  
  /* ------------------ Split-Flap Effect ------------------ */
  function updateSplitFlap(newText) {
    const container = document.getElementById("splitFlap");
    container.innerHTML = "";
    for (let i = 0; i < newText.length; i++) {
      const span = document.createElement('span');
      span.textContent = newText[i];
      span.style.opacity = 0;
      container.appendChild(span);
      setTimeout(() => {
        span.style.transition = "opacity 0.3s";
        span.style.opacity = 1;
      }, i * 50);
    }
  }
  
  /* ------------------ Global Chart Data Variables ------------------ */
  const projectCounts = { a: 0, b1: 0, b2: 0, c: 0, d: 0 };
  let pendingCSV = 5;
  let projectStatusCounts = { completed: 0, repair: 0, blank: 0 };
  let sowCounts = { cleaning: 0, inspection: 0, repair: 0, other: 0 };
  
  function updateCharts() {
    pendingCSV--;
    if (pendingCSV === 0) {
      projectCounts.b = projectCounts.b1 + projectCounts.b2;
      updatePieChart();
      updateSOWPieChart();
    }
  }
  
  /* ------------------ Load CSV Files ------------------ */
  loadCSV("projects_curr.csv", data => {
    if (!data || data.length === 0) {
      console.error("projects_curr.csv is empty or not found.");
      return;
    }
    populateTableFixed("tableA-head", "tableA-body", data);
    projectStatusCounts = countProjectStatuses(data);
    sowCounts = countProjectSOW(data);
    projectCounts.a = (data.length > 1)
      ? data.slice(1).filter(row => row.some(cell => cell.trim() !== "")).length
      : 0;
    autoScroll("contentA", 50);
    updateCharts();
  });
  
  loadCSV("service_equipments.csv", data => {
    if (!data || data.length === 0) {
      console.error("service_equipments.csv is empty or not found.");
      return;
    }
    populateTableFixed("tableB1-head", "tableB1-body", data);
    projectCounts.b1 = data.filter(row => row.some(cell => cell.trim() !== "")).length;
    autoScroll("contentB1", 50);
    updateCharts();
  });
  
  loadCSV("calib_equipments.csv", data => {
    if (!data || data.length === 0) {
      console.error("calib_equipments.csv is empty or not found.");
      return;
    }
    populateTableFixed("tableB2-head", "tableB2-body", data);
    projectCounts.b2 = data.filter(row => row.some(cell => cell.trim() !== "")).length;
    autoScroll("contentB2", 50);
    updateCharts();
  });
  

  loadCSV("projects_Future.csv", data => {
    if (!data || data.length === 0) {
      console.error("projects_Future.csv is empty or not found.");
      return;
    }
    populateTableFixed("tableC-head", "tableC-body", data);
    projectCounts.c = (data.length > 1)
      ? data.slice(1).filter(row => row.some(cell => cell.trim() !== "")).length
      : 0;
    autoScroll("contentC", 50);
    updateCharts();
  });
  
  loadCSV("Res_Dev_projects.csv", data => {
    if (!data || data.length === 0) {
      console.error("Res_Dev_projects.csv is empty or not found.");
      return;
    }
    const projects = data.filter(row => row[0] && row[0].trim() !== "").map(row => row[0]);
    projectCounts.d = projects.length;
    if (projects.length) {
      let idx = 0;
      updateSplitFlap(projects[idx]);
      setInterval(() => {
        idx = (idx + 1) % projects.length;
        updateSplitFlap(projects[idx]);
      }, 3000);
    }
    updateCharts();
  });
});
