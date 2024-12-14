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
                if (i === 7) { 
                    const link = document.createElement('a');
                    link.href = row[colIndex].trim();
                    link.target = '_blank';
                    link.textContent = 'Link';
                    td.appendChild(link);
                } else if (i === 8) { 
                    const link = document.createElement('a');
                    link.href = row[colIndex].trim();
                    link.target = '_blank';
                    link.textContent = 'Link';
                    td.appendChild(link);
                } else  if (i === 9) { 
                    const bibEntries = row[colIndex].split(/(?=@\w+\s*\{)/);
                    bibEntries.forEach(bibEntry => {
                        if (bibEntry.trim()) {
                            const buttonWrapper = document.createElement('div');
                            buttonWrapper.classList.add('button-wrapper'); 
                
                            const button = document.createElement('button');
                            button.textContent = 'Copy';
                            button.classList.add('copy-button');
                            button.onclick = () => copyBib(bibEntry.trim(), button);
                
                            buttonWrapper.appendChild(button);
                            td.appendChild(buttonWrapper);
                        }
                    })
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
        .replace(/}\s*$/, "\n}");
    return formatted;
}


function copyBib(bibContent, button) {
    const formattedBib = formatBibTex(bibContent);
    navigator.clipboard.writeText(formattedBib).then(() => {
        button.textContent = 'Copied';
        setTimeout(() => button.textContent = 'Copy', 2000);
    });
}

async function loadExcel() {
    const response = await fetch('datasets.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const tableBody = document.querySelector('#dataset-table tbody');
    const columnsToKeep = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10];
    jsonData.slice(1).forEach((row, index) => {
        const tr = document.createElement('tr');
        columnsToKeep.forEach((colIndex, i) => {
            const cellValue = row[colIndex] !== undefined && row[colIndex] !== null 
            ? row[colIndex].toString().trim() 
            : "";
            const td = document.createElement('td');
            if ((i === 7 || i === 8) && cellValue) { 
                const cell = worksheet[XLSX.utils.encode_cell({ r: index + 1, c: colIndex })];
                if (cell && cell.v) {
                    const textContent = cell.v.trim();
                    const linkRegex = /(https?:\/\/[^\s]+)/g;
                    const links = textContent.match(linkRegex);
                    if (links) {
                        links.forEach(linkUrl => {
                            const link = document.createElement('a');
                            link.href = linkUrl;
                            link.textContent = "Link";
                            link.target = "_blank";
                            td.appendChild(link);
                            td.appendChild(document.createElement('br'));
                        });
                    } else if (cell.l && cell.l.Target) {
                        const link = document.createElement('a');
                        link.href = cell.l.Target;
                        link.textContent = textContent || "Link";
                        link.target = "_blank";
                        td.appendChild(link);
                    }
                } else {
                    td.textContent = textContent;
                }
            } else  if (i === 9 && cellValue) { 
                const bibEntries = cellValue.split(/(?=@\w+\s*\{)/);
                bibEntries.forEach(bibEntry => {
                    if (bibEntry.trim()) {
                        const buttonWrapper = document.createElement('div');
                        buttonWrapper.classList.add('button-wrapper'); 
                        const button = document.createElement('button');
                        button.textContent = 'Copy';
                        button.classList.add('copy-button');
                        button.onclick = () => copyBib(bibEntry.trim(), button);
                        buttonWrapper.appendChild(button);
                        td.appendChild(buttonWrapper);
                    }
                });
            } else {
                td.textContent = cellValue;
            }
            tr.appendChild(td);

        });
        tableBody.appendChild(tr);
    });
}

window.onload = loadExcel;
// window.onload = loadCSV;