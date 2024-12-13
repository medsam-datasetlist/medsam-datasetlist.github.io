let lastSortedColumn = null;

function sortTable(columnIndex, header) {
    const table = document.querySelector("#dataset-table");
    const rows = Array.from(table.rows).slice(1);

    let sortDirection = header.classList.contains("sort-asc") ? "desc" : "asc";

    if (lastSortedColumn && lastSortedColumn !== header) {
        lastSortedColumn.classList.remove("sort-asc", "sort-desc");
    }
    lastSortedColumn = header;

    header.classList.remove("sort-asc", "sort-desc");
    header.classList.add(sortDirection === "asc" ? "sort-asc" : "sort-desc");

    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].innerText.trim();
        const cellB = rowB.cells[columnIndex].innerText.trim();
        return sortDirection === "asc" ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
    });

    rows.forEach(row => table.tBodies[0].appendChild(row));
}

async function loadCSV() {
    const response = await fetch('datasets.tsv');
    const csvText = await response.text();
    const rows = csvText.split('\n').map(row => row.split('\t'));

    const tableBody = document.querySelector('#dataset-table tbody');
    const columnsToKeep = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10];
    rows.slice(1).forEach((row, index) => {
        const tr = document.createElement('tr');
        columnsToKeep.forEach((colIndex, i) => {
            if (row[colIndex] !== undefined) {
                const td = document.createElement('td');
                if (i === 9) { 
                    const button = document.createElement('button');
                    button.textContent = 'Copy';
                    button.classList.add('copy-button');
                    button.onclick = () => copyBib(row[colIndex], button); 
                    td.appendChild(button);
                } else {
                    td.textContent = row[colIndex].trim();
                }
                tr.appendChild(td);
            }
        });
        tableBody.appendChild(tr);
    });
}

function formatBibTex(bibTex) {
    const formatted = bibTex
        .replace(/,\s+/g, ",\n  ")
        .replace(/\{\s+/g, "{\n  ")
        .replace(/,\s*\}$/g, "\n}");
    return formatted;
}


function copyBib(bibContent, button) {
    const formattedBib = formatBibTex(bibContent);
    navigator.clipboard.writeText(formattedBib).then(() => {
        button.textContent = 'Copied';
        setTimeout(() => button.textContent = 'Copy', 2000);
    });
}

window.onload = loadCSV;