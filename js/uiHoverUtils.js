/**
 * Utility functions for hover interactions and tooltips.
 */

function getHoverPopup() {
    let popup = document.getElementById("hover-popup");
    if (!popup) {
        popup = document.createElement("div");
        popup.id = "hover-popup";
        popup.style.position = "absolute";
        popup.style.background = "var(--heading-bg)";
        popup.style.color = "var(--heading-text)";
        popup.style.padding = "6px 8px";
        popup.style.borderRadius = "4px";
        popup.style.zIndex = "1000";
        popup.style.display = "none";
        popup.style.pointerEvents = "none";
        document.body.appendChild(popup);
    }
    return popup;
}

export function attachRowHover(row) {
    if (!row) return;

    // On click, show modal details.
    row.addEventListener("click", function () {
        const modal = document.getElementById("row-modal");
        const modalTableHead = modal.querySelector("#modal-data-table thead tr");
        const modalTableBody = modal.querySelector("#modal-data-table tbody tr");
        modalTableHead.innerHTML = "";
        modalTableBody.innerHTML = "";

        const headerCells = Array.from(row.closest("table").querySelectorAll("thead th"));
        const dataCells = Array.from(row.querySelectorAll("td"));
        headerCells.forEach((header, index) => {
            const th = document.createElement("th");
            th.textContent = header.textContent.trim();
            modalTableHead.appendChild(th);

            const td = document.createElement("td");
            td.textContent = dataCells[index].getAttribute("data-fulltext");
            modalTableBody.appendChild(td);
        });
        modal.style.display = "block";
    });

    // Close modal event.
    document.querySelector(".close-modal").addEventListener("click", function () {
        document.getElementById("row-modal").style.display = "none";
    });

    // On mouseenter, build and show the tooltip.
    row.addEventListener("mouseenter", function (event) {
        let popup = getHoverPopup();
        const table = row.closest("table");
        const isEquipmentRow = row.closest(".equipment-container") !== null;

        if (isEquipmentRow && table) {
            // Simple tooltip for equipment rows: display each cell as "Header: Data".
            const headerCells = Array.from(table.querySelectorAll("thead th"));
            const dataCells = Array.from(row.querySelectorAll("td"));
            let tipLines = [];
            for (let i = 0; i < dataCells.length; i++) {
                let headerText = headerCells[i] ? headerCells[i].textContent.trim() : "";
                let dataText = dataCells[i].getAttribute("data-fulltext") || "";
                tipLines.push(`${headerText}: ${dataText}`);
            }
            popup.textContent = tipLines.join("\n");
            popup.style.whiteSpace = "pre-line";
            popup.style.wordBreak = "break-word";
            popup.style.maxWidth = "300px";
        } else if (table) {
            // For non-equipment rows: include the complete header row.
            let theadHTML = "";
            let theadElement = table.querySelector("thead");
            if (theadElement && theadElement.innerHTML.trim().length > 0) {
                theadHTML = theadElement.outerHTML;
            } else if (table.dataset.header && table.dataset.header.trim().length > 0) {
                theadHTML = table.dataset.header;
            }
            // Create the tbody for the hovered row.
            const dataCells = Array.from(row.querySelectorAll("td"));
            let tbodyHTML = `<tbody><tr>`;
            for (let i = 0; i < dataCells.length; i++) {
                tbodyHTML += `<td style="border: 1px solid; padding:2px 4px;">${dataCells[i].getAttribute("data-fulltext")}</td>`;
            }
            tbodyHTML += `</tr></tbody>`;
            let tableHTML = `<table style="border-collapse: collapse;">${theadHTML}${tbodyHTML}</table>`;
            popup.innerHTML = tableHTML;
            popup.style.whiteSpace = "normal";
            popup.style.wordBreak = "normal";
            popup.style.maxWidth = "";
        }

        popup.style.display = "block";
        popup.style.left = event.pageX + 10 + "px";
        popup.style.top = event.pageY + 10 + "px";
        const theme = document.body.className || "";
        const borderColor = theme.includes("dark") ? "#ffffff" : "#000000";
        popup.style.border = `1px solid ${borderColor}`;
        popup.style.boxShadow = `0 2px 6px ${borderColor}`;
    });

    row.addEventListener("mousemove", function (event) {
        let popup = getHoverPopup();
        popup.style.left = event.pageX + 10 + "px";
        popup.style.top = event.pageY + 10 + "px";
    });

    row.addEventListener("mouseleave", function () {
        let popup = getHoverPopup();
        popup.style.display = "none";
    });
}
