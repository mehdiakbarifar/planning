/**
 * CSV Helper Library
 * 
 * Revised to mimic the original dash2.2 behavior:
 * - We parse the CSV with header: false so that the first row is not auto‑used as keys.
 * - We then manually treat the first row as the header row.
 * - If any header cell is empty, we assign a default name (e.g., "Column 5") so that all columns are present.
 */
import { attachRowHover } from './uiHoverUtils.js';

export function loadCSV(url) {
    return fetch(url)
        .then(response => response.text())
        .then(text => {
            console.log("Raw CSV first 200 characters:", text.substring(0, 200));
            return new Promise((resolve, reject) => {
                Papa.parse(text, {
                    header: false,          // Disable auto-header processing
                    skipEmptyLines: true,
                    complete: function (results) {
                        console.log("CSV Parsing complete (header: false):", results);
                        if (!results.data || results.data.length === 0) {
                            return resolve({ data: [], meta: { fields: [] } });
                        }

                        // The first row is the header, even if some cells are blank.
                        let rawHeader = results.data[0]; // This is an array of header values.
                        // Create a fields array. If a header cell is empty, we assign "Column X".
                        let fields = rawHeader.map((field, index) => {
                            return (field && field.toString().trim().length > 0)
                                ? field.toString().trim()
                                : `Column ${index + 1}`;
                        });
                        // Build data objects for the rest of the rows.
                        let dataObjects = results.data.slice(1).map(row => {
                            let obj = {};
                            for (let i = 0; i < fields.length; i++) {
                                obj[fields[i]] = row[i] !== undefined ? row[i] : "";
                            }
                            return obj;
                        });

                        console.log("Fields used:", fields);
                        resolve({ data: dataObjects, meta: { fields: fields } });
                    },
                    error: function (err) {
                        reject(err);
                    }
                });
            });
        })
        .catch(error => console.error("Error loading CSV:", error));
}

export function fetchCSV(url, callback) {
    fetch(url)
        .then(response => response.text())
        .then(text => {
            Papa.parse(text, {
                header: false,
                skipEmptyLines: true,
                complete: function (results) {
                    if (!results.data || results.data.length === 0) {
                        return callback([]);
                    }
                    let rawHeader = results.data[0];
                    let fields = rawHeader.map((field, index) => {
                        return (field && field.toString().trim().length > 0)
                            ? field.toString().trim()
                            : `Column ${index + 1}`;
                    });
                    let dataObjects = results.data.slice(1).map(row => {
                        let obj = {};
                        for (let i = 0; i < fields.length; i++) {
                            obj[fields[i]] = row[i] !== undefined ? row[i] : "";
                        }
                        return obj;
                    });
                    callback(dataObjects);
                },
                error: function (err) {
                    console.error("Error parsing CSV:", err);
                }
            });
        })
        .catch(error => console.error("Error fetching CSV:", error));
}

export function populateTableFromCSV(tableElement, data, fields) {
    if (!tableElement) return;

    console.log(`populateTableFromCSV - Table #${tableElement.id}: Using fields:`, fields);

    // Create or update the header using the provided (full) fields array.
    let thead = tableElement.querySelector("thead");
    if (!thead || thead.innerHTML.trim().length === 0) {
        thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        fields.forEach((field, index) => {
            const th = document.createElement("th");
            th.textContent = field && field.trim().length > 0 ? field.trim() : `Column ${index + 1}`;
            th.style.border = "1px solid #ddd";
            th.style.padding = "4px";
            th.style.backgroundColor = "var(--heading-bg)";
            th.style.color = "var(--heading-text)";
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        tableElement.prepend(thead);
    }

    // Cache the header HTML and fields for hover tooltips.
    tableElement.dataset.header = thead.outerHTML;
    tableElement.dataset.headerFields = JSON.stringify(fields);
    console.log(`Final header stored for table #${tableElement.id}:`, tableElement.dataset.header);

    // Create or clear the table body.
    let tbody = tableElement.querySelector("tbody");
    if (!tbody) {
        tbody = document.createElement("tbody");
        tableElement.appendChild(tbody);
    } else {
        tbody.innerHTML = "";
    }

    // Populate the table rows.
    data.forEach(row => {
        const tr = document.createElement("tr");
        fields.forEach(field => {
            const td = document.createElement("td");
            let cellValue = row[field] !== undefined ? row[field] : "";
            const truncated = cellValue.length > 20 ? cellValue.substring(0, 20) + "..." : cellValue;
            td.textContent = truncated;
            td.setAttribute("data-fulltext", cellValue);
            tr.appendChild(td);
        });

        // Attach hover behavior (the tooltip will use the stored header).
        attachRowHover(tr);

        // (Optional) Apply date-based highlighting.
        let highlight = "";
        const dateFieldIndex = fields.findIndex(f =>
            f.toLowerCase().includes("date") ||
            f.includes("تاریخ") ||
            f.includes("کالیبراسیون")
        );
        if (dateFieldIndex !== -1) {
            const dateStr = row[fields[dateFieldIndex]];
            let rowDate = new Date(dateStr);
            const now = new Date();
            if (!isNaN(rowDate)) {
                if (rowDate < now) {
                    highlight = "highlight-red";
                } else if (rowDate - now <= 30 * 24 * 60 * 60 * 1000) {
                    highlight = "highlight-yellow";
                }
            }
        }
        if (highlight) tr.classList.add(highlight);

        tbody.appendChild(tr);
    });
}

export function updateRdInfo(rdInfoElement, data) {
    if (!rdInfoElement) return;
    const rows = data.map(row =>
        row.description ? row.description : Object.values(row).join(" | ")
    );
    rdInfoElement.textContent = "";
    if (typeof animateRdRows === "function") {
        animateRdRows(rows, rdInfoElement);
    }
}
