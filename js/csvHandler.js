// js/csvHandler.js
import { loadCSV, populateTableFromCSV, updateRdInfo } from './csvHelper.js';

export function setupCSVLoading() {
    const csvFiles = [
        { url: 'data/projects_curr.csv', targetId: 'current-projects-table' },
        { url: 'data/projects_Future.csv', targetId: 'future-projects-table' },
        { url: 'data/service_equipments.csv', targetId: 'service-equipment-table' },
        { url: 'data/calib_equipments.csv', targetId: 'calibration-equipment-table' },
        { url: 'data/Res_Dev_projects.csv', targetId: 'rd-info' }
    ];

    csvFiles.forEach(file => {
        loadCSV(file.url)
            .then(results => {
                const data = results.data;
                const fields = results.meta.fields;
                const element = document.getElementById(file.targetId);
                if (!element) return;

                // If the target element is a table, populate it using our helper.
                if (element.tagName.toLowerCase() === 'table') {
                    populateTableFromCSV(element, data, fields);
                } else {
                    // Otherwise, assume it's an element where R&D info should be updated.
                    updateRdInfo(element, data);
                }
            })
            .catch(error => {
                console.error("Error loading CSV from " + file.url + ": ", error);
                const element = document.getElementById(file.targetId);
                if (element) {
                    if (element.tagName.toLowerCase() === 'table') {
                        const tbody = element.querySelector('tbody');
                        if (tbody) {
                            tbody.innerHTML = `<tr><td colspan="5">خطا در بارگذاری داده‌ها.</td></tr>`;
                        }
                    } else {
                        element.innerHTML = `<p>خطا در بارگذاری داده‌ها.</p>`;
                    }
                }
            });
    });
}
