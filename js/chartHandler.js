// chartHandler.js

import { fetchCSV } from './csvHandler.js';

/**
 * Initialize Status Chart (Pie Chart for Completed, Repair, Pending tasks) – Section D.
 */
export function initStatusChart() {
    const statusCanvas = document.getElementById('statusChart');
    if (statusCanvas) {
        const ctx = statusCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Completed', 'Repair', 'Pending'],
                datasets: [{
                    data: [10, 5, 3],
                    backgroundColor: ['#4caf50', '#ff9800', '#f44336']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'right' } }
            }
        });
    }
}

/**
 * Initialize Scope of Work Chart (Pie Chart for Cleaning, Inspection, Repair, Other) – Section D.
 */
export function initScopeOfWorkChart() {
    const sowCanvas = document.getElementById('sowChart');
    if (sowCanvas) {
        const ctx = sowCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Cleaning', 'Inspection', 'Repair', 'Other'],
                datasets: [{
                    data: [8, 6, 4, 2],
                    backgroundColor: ['#2196f3', '#9c27b0', '#e91e63', '#00bcd4']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'right' } }
            }
        });
    }
}

/**
 * Initialize Client Distribution Chart (Bar Chart from projects_curr.csv) – Section D.
 */
export function initClientChartFromCSV() {
    const clientCanvas = document.getElementById('clientChart');
    if (!clientCanvas) {
        console.error("Client Chart canvas not found!");
        return;
    }

    fetchCSV('data/projects_curr.csv', (data) => {
        if (!data || data.length === 0) {
            console.error("No data found in projects_curr.csv for Client Chart!");
            return;
        }

        const clientCounts = {};
        data.forEach(row => {
            let clientName = row['Client'] || 'Other';
            clientCounts[clientName] = (clientCounts[clientName] || 0) + 1;
        });

        const labels = Object.keys(clientCounts);
        const counts = Object.values(clientCounts);

        const ctx = clientCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Client Count',
                    data: counts,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Count' } },
                    x: { title: { display: true, text: 'Client' } }
                }
            }
        });
    });
}

/**
 * Initialize Applicant Distribution Chart (Pie Chart from projects_curr.csv) – Section D.
 */
export function initApplicantChart() {
    const applicantCanvas = document.getElementById('applicantChart');
    if (!applicantCanvas) {
        console.error("Applicant Chart canvas not found!");
        return;
    }

    fetchCSV('data/projects_curr.csv', (data) => {
        if (!data || data.length === 0) {
            console.error("No data found in projects_curr.csv for Applicant Chart!");
            return;
        }

        const applicantCounts = {};
        data.forEach(row => {
            let applicant = row['Applicant'] || 'Other';
            applicantCounts[applicant] = (applicantCounts[applicant] || 0) + 1;
        });

        const labels = Object.keys(applicantCounts);
        const counts = Object.values(applicantCounts);

        const ctx = applicantCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        '#ff6384', '#36a2eb', '#ffce56', '#8bc34a', '#ff7043',
                        '#7e57c2', '#ff9800', '#00acc1', '#4db6ac', '#d32f2f'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'right' } }
            }
        });
    });
}

/**
 * Initialize all charts (Section D only).
 * Section B's chart has been removed.
 */
export function initCharts() {
    initStatusChart();
    initScopeOfWorkChart();
    initClientChartFromCSV();
    initApplicantChart();
}
