import { initHeaderClock, initThemeSwitcher, restoreScrollPositions, initAutoScroll } from './uiUtils.js';
import { setupCSVLoading } from './csvHandler.js';
import { initCharts } from './chartHandler.js';
import { populateTables } from './tableData.js';

document.addEventListener('DOMContentLoaded', () => {
  initHeaderClock();
  initThemeSwitcher();
  restoreScrollPositions();
  initAutoScroll();
  // Populate tables before initializing charts
  populateTables();
  setupCSVLoading();
  // Initialize all charts (Charts and Client Chart read their data after CSV load)
  initCharts();
  initDragResize();
  initSectionFilters();
});

// Existing drag resize code here …
function initDragResize() {
  const container = document.querySelector('.dashboard-grid');
  const verticalBar = document.getElementById('drag-vertical');
  const horizontalBar = document.getElementById('drag-horizontal');

  const savedCols = localStorage.getItem('gridColumns');
  const savedRows = localStorage.getItem('gridRows');
  if (savedCols) container.style.gridTemplateColumns = savedCols;
  if (savedRows) container.style.gridTemplateRows = savedRows;

  function updateTableSizes() {
    document.querySelectorAll('.scrollable-table').forEach(cont => {
      cont.style.maxHeight = cont.parentElement.clientHeight + "px";
    });
  }
  window.addEventListener('resize', updateTableSizes);

  const updateDragBarPositions = () => {
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
  };
  updateDragBarPositions();
  window.addEventListener('resize', updateDragBarPositions);

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

  horizontalBar.addEventListener('mousedown', startDragHorizontal);
  function startDragHorizontal(e) {
    e.preventDefault();
    document.addEventListener('mousemove', dragHorizontal);
    document.addEventListener('mouseup', stopDragHorizontal);
  }
  function dragHorizontal(e) {
    const rect = container.getBoundingClientRect();
    let offsetY = e.clientY - rect.top;
    if (offsetY < rect.height * 0.1) offsetY = rect.height * 0.1;
    if (offsetY > rect.height * 0.9) offsetY = rect.height * 0.9;
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

// New: Initialize section filters for table search inputs.
function initSectionFilters() {
  const filters = document.querySelectorAll('.section-filter');
  filters.forEach(filter => {
    filter.addEventListener('keyup', (event) => {
      const query = event.target.value.toLowerCase();
      const targetSelector = event.target.getAttribute('data-target');
      if (!targetSelector) return;
      const table = document.querySelector(targetSelector);
      if (!table) return;
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
      });
    });
  });
}

