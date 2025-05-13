// uiUtils.js

// Header clock initialization
export function initHeaderClock() {
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');

  function updateClock() {
    const now = new Date();
    
    // Update time
    timeEl.textContent = now.toLocaleTimeString('fa-IR');
    
    // Update Persian date
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

// Theme switcher initialization
export function initThemeSwitcher() {
  const themeOptions = document.querySelectorAll('.theme-option');
  
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme');
      document.body.className = theme;
      localStorage.setItem('selectedTheme', theme);
    });
  });

  // Load saved theme
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme) {
    document.body.className = savedTheme;
  }
}

// Restore scroll positions
export function restoreScrollPositions() {
  const containers = document.querySelectorAll('.scrollable-table');
  
  containers.forEach(container => {
    const id = container.id;
    const savedPos = localStorage.getItem(`scrollPos_${id}`);
    
    if (savedPos) {
      container.scrollTop = parseInt(savedPos, 10);
    }
    
    container.addEventListener('scroll', () => {
      localStorage.setItem(`scrollPos_${id}`, container.scrollTop);
    });
  });
}

// Auto-scroll initialization for equipment tables
export function initAutoScroll() {
  const equipmentTables = [
    { id: 'service-equipment-table', container: 'service-equipment-table-container' },
    { id: 'calibration-equipment-table', container: 'calibration-equipment-table-container' }
  ];

  equipmentTables.forEach(({ id, container }) => {
    const table = document.getElementById(id);
    const containerEl = document.getElementById(container);

    if (!table || !containerEl) return;

    // Duplicate content for seamless scrolling
    const tbody = table.querySelector('tbody');
    if (tbody && tbody.children.length > 0) {
      tbody.innerHTML += tbody.innerHTML;
    }

    // Calculate scroll duration based on row count
    const rowCount = table.querySelectorAll('tbody tr').length;
    const scrollDuration = Math.max(20, rowCount * 0.75); // Minimum 20 seconds
    
    // Apply CSS animation
    table.style.animation = `equipment-scroll ${scrollDuration}s linear infinite`;
    
    // Pause on hover
    containerEl.addEventListener('mouseenter', () => {
      table.style.animationPlayState = 'paused';
    });
    
    containerEl.addEventListener('mouseleave', () => {
      table.style.animationPlayState = 'running';
    });
  });
}

// Add global CSS animations
export function addGlobalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes equipment-scroll {
      0% { transform: translateY(0); }
      100% { transform: translateY(calc(-50% + 400px)); }
    }
    
    .equipment-scroll-table {
      width: 100%;
      transform: translateY(0);
    }
    
    #service-equipment-table-container,
    #calibration-equipment-table-container {
      overflow: hidden !important;
      max-height: 400px;
    }
  `;
  document.head.appendChild(style);
}

// Table row hover effects
export function attachRowHover(row) {
  if (!row) return;

  const createPopup = () => {
    let popup = document.getElementById('hover-popup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'hover-popup';
      popup.style.position = 'absolute';
      popup.style.background = 'var(--heading-bg)';
      popup.style.color = 'var(--heading-text)';
      popup.style.padding = '6px 8px';
      popup.style.borderRadius = '4px';
      popup.style.zIndex = '1000';
      popup.style.display = 'none';
      popup.style.pointerEvents = 'none';
      document.body.appendChild(popup);
    }
    return popup;
  };

  row.addEventListener('mouseenter', (event) => {
    const popup = createPopup();
    const table = row.closest('table');
    
    if (table) {
      const headers = Array.from(table.querySelectorAll('th'));
      const cells = Array.from(row.querySelectorAll('td'));
      
      let content = '<table>';
      content += '<tr>';
      headers.forEach(header => {
        content += `<th>${header.textContent}</th>`;
      });
      content += '</tr><tr>';
      cells.forEach(cell => {
        content += `<td>${cell.getAttribute('data-fulltext')}</td>`;
      });
      content += '</tr></table>';
      
      popup.innerHTML = content;
    }

    popup.style.display = 'block';
    popup.style.left = `${event.pageX + 10}px`;
    popup.style.top = `${event.pageY + 10}px`;
  });

  row.addEventListener('mousemove', (event) => {
    const popup = document.getElementById('hover-popup');
    if (popup) {
      popup.style.left = `${event.pageX + 10}px`;
      popup.style.top = `${event.pageY + 10}px`;
    }
  });

  row.addEventListener('mouseleave', () => {
    const popup = document.getElementById('hover-popup');
    if (popup) {
      popup.style.display = 'none';
    }
  });
}

// R&D Projects animation
export function animateRdRows(rows, container, originalRows = []) {
  if (rows.length === 0) {
    animateRdRows(originalRows, container);
    return;
  }

  const rowText = rows.shift();
  const rowElem = document.createElement('div');
  rowElem.className = 'rd-row';
  container.appendChild(rowElem);

  // Animate each character
  rowText.split('').forEach((char, index) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.opacity = '0';
    span.style.transformOrigin = 'top';
    span.style.animation = `flip 0.5s ease forwards`;
    span.style.animationDelay = `${index * 0.05}s`;
    rowElem.appendChild(span);
  });

  // Remove row after animation
  const totalTime = rowText.length * 0.05 + 0.5;
  setTimeout(() => {
    rowElem.style.opacity = '0';
    setTimeout(() => {
      container.removeChild(rowElem);
      animateRdRows(rows, container, originalRows);
    }, 500);
  }, totalTime * 1000);
}

// Get hover popup element
function getHoverPopup() {
  return document.getElementById('hover-popup') || createPopupElement();
}

// For backward compatibility
export function initSplitFlapEffect() {}
