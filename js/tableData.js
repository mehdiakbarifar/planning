import { loadCSV, populateTableFromCSV } from './csvHelper.js';

export function populateTables() {
    // Use the CSV file for Section A (current projects)
    loadCSV("data/projects_curr.csv").then(results => {
        // Make sure to pass the full fields array from results.meta.fields,
        // which now includes all columns from the CSV based on the first row.
        populateTableFromCSV(document.getElementById("current-projects-table"),
            results.data,
            results.meta.fields);
    });
}
