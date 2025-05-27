// resizeHandler.js

// Throttle helper function
function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall < delay) return;
        lastCall = now;
        return func.apply(this, args);
    };
}

export function initDragResize() {
    if (window.innerWidth < 768) return; // Disable on mobile

    const container = document.querySelector('.dashboard-grid');
    const verticalBar = document.getElementById('drag-vertical');
    const horizontalBar = document.getElementById('drag-horizontal');

    // Restore saved grid dimensions if available
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
            // Hint for hardware acceleration:
            tooltip.style.willChange = "transform";
            document.body.appendChild(tooltip);
        }
        return tooltip;
    }
    const resizeTooltip = createResizeTooltip();

    verticalBar.addEventListener('mousedown', startDragVertical);
    function startDragVertical(e) {
        e.preventDefault();
        document.addEventListener('mousemove', throttledDragVertical);
        document.addEventListener('mouseup', stopDragVertical);
    }
    const throttledDragVertical = throttle(function dragVertical(e) {
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
    }, 50);
    function stopDragVertical() {
        document.removeEventListener('mousemove', throttledDragVertical);
        document.removeEventListener('mouseup', stopDragVertical);
        resizeTooltip.style.display = "none";
        localStorage.setItem('gridColumns', container.style.gridTemplateColumns);
    }

    horizontalBar.addEventListener('mousedown', startDragHorizontal);
    function startDragHorizontal(e) {
        e.preventDefault();
        document.addEventListener('mousemove', throttledDragHorizontal);
        document.addEventListener('mouseup', stopDragHorizontal);
    }
    const throttledDragHorizontal = throttle(function dragHorizontal(e) {
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
    }, 50);
    function stopDragHorizontal() {
        document.removeEventListener('mousemove', throttledDragHorizontal);
        document.removeEventListener('mouseup', stopDragHorizontal);
        resizeTooltip.style.display = "none";
        localStorage.setItem('gridRows', container.style.gridTemplateRows);
    }
}
