// filterHandler.js

export function initSectionFilters() {
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
