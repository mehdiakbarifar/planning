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

// Restore scroll positions
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

// Revised auto-scroll with pause on hover
// If the container's content is too short (i.e. it does not overflow),
// we duplicate its content so that auto-scrolling works.
export function initAutoScroll() {
  const containers = document.querySelectorAll('.scrollable-table');
  containers.forEach(container => {
    // Slight delay to allow content to load before checking scrollHeight
    setTimeout(() => {
      if (container.scrollHeight <= container.clientHeight + 5) {
        container.innerHTML += container.innerHTML;
      }
    }, 100);
    const scrollSpeed = 1, intervalTime = 50;
    let autoScrollTimer = setInterval(() => {
      if (container.scrollTop >= container.scrollHeight - container.clientHeight)
        container.scrollTop = 0;
      else container.scrollTop += scrollSpeed;
    }, intervalTime);
    container.addEventListener('mouseenter', () => { clearInterval(autoScrollTimer); });
    container.addEventListener('mouseleave', () => {
      autoScrollTimer = setInterval(() => {
        if (container.scrollTop >= container.scrollHeight - container.clientHeight)
          container.scrollTop = 0;
        else container.scrollTop += scrollSpeed;
      }, intervalTime);
    });
  });
}

// Attach hover events to display a pop-up table that shows the full header and row data.
export function attachRowHover(row) {
  if (!row) return;
  row.addEventListener("mouseenter", function (event) {
    let popup = getHoverPopup();
    const table = row.closest("table");
    if (table) {
      // Use existing <thead> to build header, so that all CSV header names appear correctly.
      const headerCells = Array.from(table.querySelectorAll("thead th"));
      const dataCells = Array.from(row.querySelectorAll("td"));
      let tableHTML = `<table style="border-collapse: collapse;">`;
      tableHTML += `<thead><tr>`;
      for (let i = 0; i < dataCells.length; i++) {
        const width = headerCells[i]
          ? headerCells[i].getBoundingClientRect().width
          : dataCells[i].getBoundingClientRect().width;
        const headerText = headerCells[i]
          ? headerCells[i].textContent.trim()
          : `Column ${i + 1}`;
        tableHTML += `<th style="border: 1px solid; padding:2px 4px; width:${width}px;">${headerText}</th>`;
      }
      tableHTML += `</tr></thead>`;
      tableHTML += `<tbody><tr>`;
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
    // Set dynamic border and shadow color based on theme (if theme contains "dark", use light border, else dark)
    let theme = document.body.className;
    let borderColor = theme.indexOf("dark") !== -1 ? "#ffffff" : "#000000";
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

// R&D row-by-row split-flap animation: animate rows one-by-one, and when the last row finishes, start over.
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
  
  const totalTime = rowText.length * 0.05 + 0.5; // seconds
  setTimeout(() => {
    rowElem.style.transition = "opacity 0.5s ease";
    rowElem.style.opacity = "0";
    setTimeout(() => {
      container.removeChild(rowElem);
      animateRdRows(rows, container, originalRows);
    }, 500);
  }, totalTime * 1000 + 500);
}

// For backward compatibility.
export function initSplitFlapEffect() {}
