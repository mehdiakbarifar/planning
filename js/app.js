import { initHeaderClock, initThemeSwitcher, initFontSizeAdjuster, restoreScrollPositions, initAutoScroll } from './uiUtils.js';
import { setupCSVLoading } from './csvHandler.js';
import { initCharts } from './chartHandler.js';
import { populateTables } from './tableData.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize header clock, theme switcher, font-size adjuster, and auto-scroll.
  initHeaderClock();
  initThemeSwitcher();
  restoreScrollPositions();
  initAutoScroll();
  initFontSizeAdjuster();

  // Populate CSV-based tables and initialize charts.
  populateTables();
  setupCSVLoading();
  initCharts();

  // Initialize desktop-specific drag-resize and section filters.
  initDragResize();
  initSectionFilters();

  // Adapt the UI based on viewport size and initialize mobile tab navigation.
  adaptToViewport();
  initTabNavigation();
});

// ---- Adapt Desktop vs Mobile View ---- //
function adaptToViewport() {
  const isMobile = window.innerWidth < 768;
  const grid = document.querySelector('.dashboard-grid');
  const tabs = document.querySelector('.tab-nav');

  // On mobile, set grid to block (so its child sections can become visible via JS)
  if (grid) {
    grid.style.display = isMobile ? 'block' : 'grid';
  }
  if (tabs) {
    tabs.style.display = isMobile ? 'flex' : 'none';
  }
}
window.addEventListener('resize', adaptToViewport);

// ---- Initialize Mobile Tab Navigation ---- //
function initTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const sections = document.querySelectorAll('.section');

  // For testing, force default to section-a each time.
  const defaultTab = 'section-a';
  // Remove active class from all sections, then add for default.
  sections.forEach(section => section.classList.remove('active'));
  const activeSection = document.getElementById(defaultTab);
  if (activeSection) {
    activeSection.classList.add('active');
  }
  
  // Remove active class from all tab buttons, then add for default.
  tabButtons.forEach(btn => btn.classList.remove('active'));
  const activeButton = document.querySelector(`.tab-button[data-target="${defaultTab}"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }
  
  console.log("Default active tab set to:", defaultTab);
  
  // Set up click listeners for each tab button.
  tabButtons.forEach(button => {
    button.addEventListener('click', function () {
      console.log("Tab clicked:", this.getAttribute('data-target'));
      // Remove active state from all tabs and sections.
      tabButtons.forEach(btn => btn.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));
      
      // Activate the clicked tab and its corresponding section.
      this.classList.add('active');
      const target = this.getAttribute('data-target');
      const targetSection = document.getElementById(target);
      if (targetSection) {
        targetSection.classList.add('active');
        console.log("Activated section:", target);
      } else {
        console.error("Section not found for target:", target);
      }
      
      // (Optional) Save active tab state to localStorage.
      // localStorage.setItem('activeTab', target);
    });
  });
}

// ---- Desktop Drag Resize Functionality ---- //
function initDragResize() {
  // Do not apply drag-resize on mobile.
  if (window.innerWidth < 768) return;
  
  const container = document.querySelector('.dashboard-grid');
  const verticalBar = document.getElementById('drag-vertical');
  const horizontalBar = document.getElementById('drag-horizontal');

  // Restore saved grid template dimensions if available.
  const savedCols = localStorage.getItem('gridColumns');
  const savedRows = localStorage.getItem('gridRows');
  if (savedCols) container.style.gridTemplateColumns = savedCols;
  if (savedRows) container.style.gridTemplateRows = savedRows;

  // Update table container sizes.
  function updateTableSizes() {
    document.querySelectorAll('.scrollable-table').forEach(cont => {
      cont.style.maxHeight = cont.parentElement.clientHeight + "px";
    });
  }
  window.addEventListener('resize', updateTableSizes);

  // Update drag bar positions.
  function updateDragBarPositions() {
    const rect = container.getBoundingClientRect();
    const colTemplate = getComputedStyle(container).gridTemplateColumns.split(" ");
    let col1Width = parseFloat(colTemplate[0]);
    if (colTemplate[0].endsWith('%')) {
      col1Width = rect.width * (parseFloat(colTemplate[0]) / 100);
    }
    verticalBar.style.left = (col1Width - 2.5) + 'px';

    const rowTemplate = getComputedStyle(container).gridTemplateRows.split(" ");
    let row1Height = parseFloat(rowTemplate[0]);
    if (rowTemplate[0].endsWith('%')) {
      row1Height = rect.height * (parseFloat(rowTemplate[0]) / 100);
    }
    horizontalBar.style.top = (row1Height - 2.5) + 'px';
  }
  updateDragBarPositions();
  window.addEventListener('resize', updateDragBarPositions);

  // Create and retrieve the resize tooltip element.
  function createResizeTooltip() {
    let tooltip = document.getElementById("resize-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "resize-tooltip";
      tooltip.style.position = "absolute";
      tooltip.style.background = "rgba(0, 0, 0, 0.7)";
      tooltip.style.color = "#fff";
      tooltip.style.padding = "5px";
      tooltip.style.borderRadius = "4px";
      tooltip.style.fontSize = "12px";
      tooltip.style.pointerEvents = "none";
      tooltip.style.display = "none";
      document.body.appendChild(tooltip);
    }
    return tooltip;
  }
  const resizeTooltip = createResizeTooltip();

  // Vertical drag events.
  verticalBar.addEventListener('mousedown', startDragVertical);
  function startDragVertical(e) {
    e.preventDefault();
    document.addEventListener('mousemove', dragVertical);
    document.addEventListener('mouseup', stopDragVertical);
  }
  function dragVertical(e) {
    const rect = container.getBoundingClientRect();
    let offsetX = e.clientX - rect.left;
    if (offsetX < rect.width * 0.01) offsetX = rect.width * 0.01;
    if (offsetX > rect.width * 0.99) offsetX = rect.width * 0.99;
    const col1Percent = (offsetX / rect.width) * 100;
    const col2Percent = 100 - col1Percent;
    
    resizeTooltip.style.left = e.clientX + "px";
    resizeTooltip.style.top = e.clientY + "px";
    resizeTooltip.textContent = `${Math.round(col1Percent)}% / ${Math.round(col2Percent)}%`;
    resizeTooltip.style.display = "block";
    
    container.style.gridTemplateColumns = `${col1Percent}% ${col2Percent}%`;
    verticalBar.style.left = (offsetX - 2.5) + 'px';
  }
  function stopDragVertical() {
    document.removeEventListener('mousemove', dragVertical);
    document.removeEventListener('mouseup', stopDragVertical);
    resizeTooltip.style.display = "none";
    localStorage.setItem('gridColumns', container.style.gridTemplateColumns);
  }

  // Horizontal drag events.
  horizontalBar.addEventListener('mousedown', startDragHorizontal);
  function startDragHorizontal(e) {
    e.preventDefault();
    document.addEventListener('mousemove', dragHorizontal);
    document.addEventListener('mouseup', stopDragHorizontal);
  }
  function dragHorizontal(e) {
    const rect = container.getBoundingClientRect();
    let offsetY = e.clientY - rect.top;
    if (offsetY < rect.height * 0.01) offsetY = rect.height * 0.01;
    if (offsetY > rect.height * 0.99) offsetY = rect.height * 0.99;
    const row1Percent = (offsetY / rect.height) * 100;
    const row2Percent = 100 - row1Percent;
    
    resizeTooltip.style.left = e.clientX + "px";
    resizeTooltip.style.top = e.clientY + "px";
    resizeTooltip.textContent = `${Math.round(row1Percent)}% / ${Math.round(row2Percent)}%`;
    resizeTooltip.style.display = "block";
    
    container.style.gridTemplateRows = `${row1Percent}% ${row2Percent}%`;
    horizontalBar.style.top = (offsetY - 2.5) + 'px';
  }
  function stopDragHorizontal() {
    document.removeEventListener('mousemove', dragHorizontal);
    document.removeEventListener('mouseup', stopDragHorizontal);
    resizeTooltip.style.display = "none";
    localStorage.setItem('gridRows', container.style.gridTemplateRows);
  }
}

// ---- Initialize Section Filters for Table Search Inputs ---- //
function initSectionFilters() {
  const filters = document.querySelectorAll('.section-filter');
  filters.forEach(filter => {
    filter.addEventListener('keyup', (event) => {
      const query = event.target.value.toLowerCase();
      const targetSelector = event.target.getAttribute('data-target');
      if (!targetSelector) return;
      const table = document.querySelector(targetSelector);
      if (!table) return;
      table.querySelectorAll("tbody tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(query) ? "" : "none";
      });
    });
  });
}
