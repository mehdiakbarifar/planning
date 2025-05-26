import {
    initHeaderClock,
    initThemeSwitcher,
    initFontSizeAdjuster,
    restoreScrollPositions,
    initAutoScroll
} from './uiUtils.js';
import { setupCSVLoading } from './csvHandler.js';
import { initCharts } from './chartHandler.js';
import { populateTables } from './tableData.js';

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    // Common functionalities across views
    initHeaderClock();
    initThemeSwitcher();
    restoreScrollPositions();
    initFontSizeAdjuster();

    // Populate tables and initialize charts; these functions load CSV data etc.
    populateTables();
    setupCSVLoading();
    initCharts();

    // Desktop-only functionalities; function internals will check viewport
    initAutoScroll();
    initDragResize();
    initSectionFilters();

    // Adapt the layout and initialize mobile tab navigation
    adaptToViewport();
    initTabNavigation();

    // For mobile view, initialize pagination on selected tables
    if (window.innerWidth < 768) {
        // Wait a moment for the tables to be populated; ideally your CSV code triggers an event,
        // but here we use a timeout as a fallback.
        setTimeout(initMobilePagination, 1000);
    }
});

// ---- Adapt Layout Based on Viewport ---- //
function adaptToViewport() {
    const isMobile = window.innerWidth < 768;
    const grid = document.querySelector('.dashboard-grid');
    const tabs = document.querySelector('.tab-nav');

    if (grid) {
        grid.style.display = isMobile ? 'block' : 'grid';
        grid.style.width = isMobile ? '100%' : 'auto';
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

    // Default active section is 'section-a'
    const defaultTab = 'section-a';
    sections.forEach(section => section.classList.remove('active'));
    const activeSection = document.getElementById(defaultTab);
    if (activeSection) activeSection.classList.add('active');

    tabButtons.forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`.tab-button[data-target="${defaultTab}"]`);
    if (activeButton) activeButton.classList.add('active');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            this.classList.add('active');
            const target = this.getAttribute('data-target');
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.classList.add('active');
            } else {
                console.error("Section not found for target:", target);
            }
        });
    });
}

// ---- Desktop Drag Resize (Only Active on Desktop) ---- //
function initDragResize() {
    if (window.innerWidth < 768) return; // Do nothing on mobile

    const container = document.querySelector('.dashboard-grid');
    const verticalBar = document.getElementById('drag-vertical');
    const horizontalBar = document.getElementById('drag-horizontal');

    // Restore saved grid dimensions from localStorage if available
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

// ---- Initialize Section Filters (for table search inputs) ---- //
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

/* ----------------------------- */
/* Mobile Pagination Functions   */
/* (Only active on mobile view)  */
/* ----------------------------- */
function paginateTable(tableId, rowsPerPage) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll("tr"));
    // Do not paginate if rows are fewer than the threshold.
    if (rows.length <= rowsPerPage) return;

    let currentPage = 0;
    const totalPages = Math.ceil(rows.length / rowsPerPage);

    // Create a pagination control container and insert after the table
    let paginationContainer = document.createElement("div");
    paginationContainer.className = "pagination-controls";
    paginationContainer.style.textAlign = "center";
    paginationContainer.style.marginTop = "8px";
    table.parentElement.appendChild(paginationContainer);

    function goToPage(page) {
        currentPage = page;
        rows.forEach((row, index) => {
            // Display rows that fall within the current page range
            row.style.display = (index >= (currentPage * rowsPerPage) && index < ((currentPage + 1) * rowsPerPage)) ? "table-row" : "none";
        });
        updatePaginationControls();
    }

    function updatePaginationControls() {
        paginationContainer.innerHTML = "";
        if (currentPage > 0) {
            let btnPrev = document.createElement("button");
            btnPrev.textContent = "قبلی";
            btnPrev.style.marginRight = "5px";
            btnPrev.onclick = () => goToPage(currentPage - 1);
            paginationContainer.appendChild(btnPrev);
        }

        // Display page indicator
        let pageIndicator = document.createElement("span");
        pageIndicator.textContent = `صفحه ${currentPage + 1} از ${totalPages}`;
        pageIndicator.style.margin = "0 5px";
        paginationContainer.appendChild(pageIndicator);

        if (currentPage < totalPages - 1) {
            let btnNext = document.createElement("button");
            btnNext.textContent = "بعدی";
            btnNext.style.marginLeft = "5px";
            btnNext.onclick = () => goToPage(currentPage + 1);
            paginationContainer.appendChild(btnNext);
        }
    }

    goToPage(0);
}

function initMobilePagination() {
    // Adjust table IDs and rows per page as needed for mobile view:
    // For example, paginate the "current-projects-table" and "future-projects-table"
    paginateTable("current-projects-table", 20);
    paginateTable("future-projects-table", 20);
}
