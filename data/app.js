import { initHeaderClock, initThemeSwitcher, initFontSizeAdjuster, restoreScrollPositions, initAutoScroll } from './uiUtils.js';
import { setupCSVLoading } from './csvHandler.js';
import { initCharts } from './chartHandler.js';
import { populateTables } from './tableData.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize clock, theme switcher, auto-scroll, and accessibility features
  initHeaderClock();
  initThemeSwitcher();
  restoreScrollPositions();
  initAutoScroll();
  initFontSizeAdjuster();

  // Populate tables and load charts after CSV processing
  populateTables();
  setupCSVLoading();
  initCharts();

  // Initialize desktop-specific features
  initDragResize();
  initSectionFilters();

  // Adapt UI for different viewports and handle tab navigation
  adaptToViewport();
  initTabNavigation();
});

// ---- Adapt Desktop vs Mobile View ---- //
function adaptToViewport() {
  const isMobile = window.innerWidth < 768;
  const grid = document.querySelector('.dashboard-grid');
  const tabs = document.querySelector('.tab-nav');

  if (grid) {
    grid.style.display = isMobile ? 'block' : 'grid';
  }
  if (tabs) {
    tabs.style.display = isMobile ? 'flex' : 'none';
  }

  // Hide drag bars on mobile; show on desktop
  const verticalBar = document.getElementById('drag-vertical');
  const horizontalBar = document.getElementById('drag-horizontal');
  if (verticalBar) verticalBar.style.display = isMobile ? 'none' : 'block';
  if (horizontalBar) horizontalBar.style.display = isMobile ? 'none' : 'block';

  // Ensure chart canvases have a minimum height
  document.querySelectorAll("canvas").forEach(canvas => {
    canvas.style.minHeight = "200px";
    canvas.style.display = "block";
  });

  console.log("Viewport adapted:", isMobile ? "Mobile mode enabled" : "Desktop mode enabled");
}
window.addEventListener('resize', adaptToViewport);

// ---- Initialize Mobile Tab Navigation ---- //
function initTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const sections = document.querySelectorAll('.section');

  // Force default tab to section-a for testing
  const defaultTab = 'section-a';

  // Remove active class from all sections and set the default.
  sections.forEach(section => section.classList.remove('active'));
  const defaultSection = document.getElementById(defaultTab);
  if (defaultSection) {
    defaultSection.classList.add('active');
  } else {
    console.error("Default section not found:", defaultTab);
  }

  // Remove active class from all tab buttons and set for default.
  tabButtons.forEach(btn => btn.classList.remove('active'));
  const defaultButton = document.querySelector(`.tab-button[data-target="${defaultTab}"]`);
  if (defaultButton) {
    defaultButton.classList.add('active');
  } else {
    console.error("Default tab button not found for:", defaultTab);
  }

  console.log("Default active tab set to:", defaultTab);

  // Attach click event listeners to each tab button.
  tabButtons.forEach(button => {
    button.addEventListener('click', function () {
      const target = this.getAttribute('data-target');
      console.log("Tab clicked:", target);

      // Remove active state from all tabs and sections.
      tabButtons.forEach(btn => btn.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));

      // Activate the clicked tab and corresponding section.
      this.classList.add('active');
      const targetSection = document.getElementById(target);
      if (targetSection) {
        targetSection.classList.add('active');
        console.log("Activated section:", target);
      } else {
        console.error("Section not found for target:", target);
      }
    });
  });
}

// ---- Desktop Drag Resize Functionality ---- //
function initDragResize() {
  // Only operate on desktop (viewport width >= 768px)
  if (window.innerWidth < 768) {
    console.log("initDragResize: Skipped on mobile");
    return;
  }

  const container = document.querySelector('.dashboard-grid');
  if (!container) {
    console.error("initDragResize: Container not found");
    return;
  }

  const verticalBar = document.getElementById('drag-vertical');
  const horizontalBar = document.getElementById('drag-horizontal');

  if (!verticalBar || !horizontalBar) {
    console.error("initDragResize: Drag bars not found");
    return;
  }

  // Restore saved grid dimensions from localStorage if available.
  const savedCols = localStorage.getItem('gridColumns');
  const savedRows = localStorage.getItem('gridRows');
  if (savedCols) {
    container.style.gridTemplateColumns = savedCols;
    console.log("Restored grid columns:", savedCols);
  }
  if (savedRows) {
    container.style.gridTemplateRows = savedRows;
    console.log("Restored grid rows:", savedRows);
  }

  // Function to update table sizes
  function updateTableSizes() {
    document.querySelectorAll('.scrollable-table').forEach(cont => {
      cont.style.maxHeight = cont.parentElement.clientHeight + "px";
    });
  }
  window.addEventListener('resize', updateTableSizes);

  // Function to update drag bar positions based on grid dimensions
  function updateDragBarPositions() {
    const rect = container.getBoundingClientRect();
    const colTemplate = getComputedStyle(container).gridTemplateColumns.split(" ");
    let col1Width = parseFloat(colTemplate[0]);
    if (colTemplate[0].endsWith('%')) {
      col1Width = rect.width * (parseFloat(colTemplate[0]) / 100);
    }
    verticalBar.style.left = (col1Width - 2.5) + 'px';
    console.log("Vertical bar left position updated to:", verticalBar.style.left);

    const rowTemplate = getComputedStyle(container).gridTemplateRows.split(" ");
    let row1Height = parseFloat(rowTemplate[0]);
    if (rowTemplate[0].endsWith('%')) {
      row1Height = rect.height * (parseFloat(rowTemplate[0]) / 100);
    }
    horizontalBar.style.top = (row1Height - 2.5) + 'px';
    console.log("Horizontal bar top position updated to:", horizontalBar.style.top);
  }
  updateDragBarPositions();
  window.addEventListener('resize', updateDragBarPositions);

  // Create and retrieve resize tooltip element.
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

  // Attach vertical drag listener.
  verticalBar.addEventListener('mousedown', startDragVertical);
  function startDragVertical(e) {
    console.log("Vertical drag started");
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
    console.log("Vertical drag stopped");
    document.removeEventListener('mousemove', dragVertical);
    document.removeEventListener('mouseup', stopDragVertical);
    resizeTooltip.style.display = "none";
    localStorage.setItem('gridColumns', container.style.gridTemplateColumns);
  }

  // Attach horizontal drag listener.
  horizontalBar.addEventListener('mousedown', startDragHorizontal);
  function startDragHorizontal(e) {
    console.log("Horizontal drag started");
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
    console.log("Horizontal drag stopped");
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

// ---- Force Chart Refresh on Mobile Resize ---- //
window.addEventListener("resize", function () {
  console.log("Viewport resized, attempting chart refresh...");
  initCharts();
});
