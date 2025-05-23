// Header clock
export function initHeaderClock() {
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');

  function updateClock() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString();
    const persianDate = now.toLocaleDateString('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    dateEl.textContent = persianDate;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// Theme switcher
export function initThemeSwitcher() {
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme');
      document.body.className = theme;
      localStorage.setItem('selectedTheme', theme);
    });
  });

  const savedTheme = localStorage.getItem('selectedTheme');
  document.body.className = savedTheme ? savedTheme : 'theme-dark';
}

// Restore scroll positions for all tables
export function restoreScrollPositions() {
  const containers = document.querySelectorAll('.scrollable-table');
  containers.forEach(container => {
    const id = container.id;
    const savedPos = localStorage.getItem('scrollPos_' + id);
    if (savedPos) container.scrollTop = parseInt(savedPos, 10);
    
    container.addEventListener('scroll', () => {
      localStorage.setItem('scrollPos_' + id, container.scrollTop);
    });
  });
}

// Auto-scroll function for all tables
export function initAutoScroll() {
  const containers = document.querySelectorAll('.scrollable-table');

  containers.forEach(container => {
    if (!container.dataset.duplicated) {
      container.innerHTML += container.innerHTML; // Ensure looping works
      container.dataset.duplicated = "true";
    }

    let paused = false;
    container.addEventListener('mouseenter', () => { paused = true; });
    container.addEventListener('mouseleave', () => { paused = false; });

    const speed = 0.5;

    function scrollStep() {
      if (!paused) {
        container.scrollTop += speed;
        const resetThreshold = container.scrollHeight - container.clientHeight;
        if (container.scrollTop >= resetThreshold) {
          container.scrollTop = 0;
        }
      }
      requestAnimationFrame(scrollStep);
    }

    requestAnimationFrame(scrollStep);
  });
}

// Attach hover events for popup effect
export function attachRowHover(row) {
  if (!row) return;
  row.addEventListener("click", function () {
    const modal = document.getElementById("row-modal");
    const modalTableHead = modal.querySelector("#modal-data-table thead tr");
    const modalTableBody = modal.querySelector("#modal-data-table tbody tr");
    
    modalTableHead.innerHTML = "";
    modalTableBody.innerHTML = "";

    const headerCells = Array.from(row.closest("table").querySelectorAll("thead th"));
    const dataCells = Array.from(row.querySelectorAll("td"));

    headerCells.forEach((header, index) => {
      const th = document.createElement("th");
      th.textContent = header.textContent.trim();
      modalTableHead.appendChild(th);
      
      const td = document.createElement("td");
      td.textContent = dataCells[index].getAttribute("data-fulltext");
      modalTableBody.appendChild(td);
    });

    modal.style.display = "block";
  });

  document.querySelector(".close-modal").addEventListener("click", function () {
    document.getElementById("row-modal").style.display = "none";
  });
  row.addEventListener("mouseenter", function (event) {
    let popup = getHoverPopup();
    const table = row.closest("table");

    if (table) {
      const headerCells = Array.from(table.querySelectorAll("thead th"));
      const dataCells = Array.from(row.querySelectorAll("td"));
      let tableHTML = `<table style="border-collapse: collapse;">`;
      tableHTML += `<thead><tr>`;
      
      for (let i = 0; i < dataCells.length; i++) {
        const width = headerCells[i] ? headerCells[i].getBoundingClientRect().width : dataCells[i].getBoundingClientRect().width;
        const headerText = headerCells[i] ? headerCells[i].textContent.trim() : `Column ${i + 1}`;
        tableHTML += `<th style="border: 1px solid; padding:2px 4px; width:${width}px;">${headerText}</th>`;
      }

      tableHTML += `</tr></thead><tbody><tr>`;
      for (let i = 0; i < dataCells.length; i++) {
        const width = dataCells[i].getBoundingClientRect().width;
        tableHTML += `<td style="border: 1px solid; padding:2px 4px; width:${width}px;">${dataCells[i].getAttribute("data-fulltext")}</td>`;
      }
      tableHTML += `</tr></tbody></table>`;

      popup.innerHTML = tableHTML;
    }

    popup.style.display = "block";
    popup.style.left = event.pageX + 10 + "px";
    popup.style.top = event.pageY + 10 + "px";
    
    let theme = document.body.className;
    let borderColor = theme.includes("dark") ? "#ffffff" : "#000000";
    popup.style.border = `1px solid ${borderColor}`;
    popup.style.boxShadow = `0 2px 6px ${borderColor}`;
  });

  row.addEventListener("mousemove", function (event) {
    let popup = getHoverPopup();
    popup.style.left = event.pageX + 10 + "px";
    popup.style.top = event.pageY + 10 + "px";
  });

  row.addEventListener("mouseleave", function () {
    let popup = getHoverPopup();
    popup.style.display = "none";
  });
}

function getHoverPopup() {
  let popup = document.getElementById("hover-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "hover-popup";
    popup.style.position = "absolute";
    popup.style.background = "var(--heading-bg)";
    popup.style.color = "var(--heading-text)";
    popup.style.padding = "6px 8px";
    popup.style.borderRadius = "4px";
    popup.style.zIndex = "1000";
    popup.style.display = "none";
    popup.style.pointerEvents = "none";
    document.body.appendChild(popup);
  }
  return popup;
}

// R&D Projects animation effect (row-by-row split-flap transition)
export function animateRdRows(rows, container, originalRows) {
  if (!originalRows) {
    originalRows = rows.slice();
  }
  
  if (rows.length === 0) {
    animateRdRows(originalRows.slice(), container, originalRows);
    return;
  }

  const rowText = rows.shift();
  const rowElem = document.createElement("div");
  rowElem.className = "rd-row";
  container.appendChild(rowElem);

  rowText.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.style.opacity = "0";
    span.style.display = "inline-block";
    span.style.transformOrigin = "top";
    span.style.animation = `flip 0.5s ease forwards`;
    span.style.animationDelay = `${index * 0.05}s`;
    rowElem.appendChild(span);
  });

  const totalTime = rowText.length * 0.05 + 0.5; 
  setTimeout(() => {
    rowElem.style.transition = "opacity 0.5s ease";
    rowElem.style.opacity = "0";
    setTimeout(() => {
      container.removeChild(rowElem);
      animateRdRows(rows, container, originalRows);
    }, 500);
  }, totalTime * 1000 + 500);
}

// New: Initialize font size adjuster for content (excludes header)
export function initFontSizeAdjuster() {
  const increaseBtn = document.getElementById('increase-font');
  const decreaseBtn = document.getElementById('decrease-font');
  // Retrieve the current content font size from localStorage or use default 1rem.
  let currentFontSize = parseFloat(localStorage.getItem('contentFontSize')) || 1;
  
  // Set the CSS variable on the root element.
  document.documentElement.style.setProperty('--content-font-size', currentFontSize + 'rem');

  increaseBtn.addEventListener('click', () => {
    currentFontSize += 0.1;
    document.documentElement.style.setProperty('--content-font-size', currentFontSize.toFixed(1) + 'rem');
    localStorage.setItem('contentFontSize', currentFontSize.toFixed(1));
  });

  decreaseBtn.addEventListener('click', () => {
    currentFontSize = Math.max(0.5, currentFontSize - 0.1);
    document.documentElement.style.setProperty('--content-font-size', currentFontSize.toFixed(1) + 'rem');
    localStorage.setItem('contentFontSize', currentFontSize.toFixed(1));
  });
}
