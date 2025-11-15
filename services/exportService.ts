// This service provides functions to export data to PDF, Excel, and CSV formats.
// It relies on jsPDF, jsPDF-AutoTable, and SheetJS (XLSX) libraries loaded from a CDN.

// TypeScript declarations for global variables from CDN scripts.
declare const jsPDF: any;
declare const XLSX: any;

interface ExportData {
  [key: string]: any;
}

/**
 * Exports data to a PDF file.
 * NOTE: For Arabic text to render correctly, jsPDF requires a font that supports Arabic characters.
 * This implementation uses default fonts, which may not render all characters correctly.
 * For full support, a custom font should be embedded.
 * @param data Array of data objects.
 * @param headers Array of header strings.
 * @param title The title of the document.
 * @param filename The name of the file to save.
 */
export const exportToPdf = (data: ExportData[], headers: string[], title: string, filename: string) => {
  const doc = new jsPDF.default();

  doc.text(title, 14, 16);

  const tableColumn = headers;
  const tableRows: (string | number)[][] = [];

  data.forEach(item => {
    const rowData = Object.values(item).map(value => value ?? '');
    tableRows.push(rowData);
  });

  // The autoTable plugin is attached to the jsPDF instance.
  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    // Add basic styling for RTL support if needed, but character rendering is the main issue.
    didParseCell: function (data: any) {
        // A simple check for Arabic characters
        const regex = /[\u0600-\u06FF]/;
        if (data.section === 'body' && regex.test(data.cell.text)) {
            data.cell.styles.halign = 'right';
        }
    }
  });

  doc.save(`${filename}.pdf`);
};

/**
 * Exports data to an Excel (.xlsx) file.
 * @param data Array of data objects.
 * @param filename The name of the file to save.
 */
export const exportToExcel = (data: ExportData[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

/**
 * Exports data to a CSV file.
 * @param data Array of data objects.
 * @param filename The name of the file to save.
 */
export const exportToCsv = (data: ExportData[], filename:string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
    const link = document.createElement("a");
    if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
