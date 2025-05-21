export type ColumnExportConfig<T> = {
    header: string;
    accessor: string | ((item: T) => string | number | boolean | null | undefined);
    includeInExport?: boolean;
};

/**
 * Exports data to a downloadable CSV file
 * @param columns Configuration for columns to export
 * @param data Array of data to export
 * @param filename Optional custom filename (default: 'export-{date}.csv')
 */
export const exportToCsv = <T extends object>(
    columns: ColumnExportConfig<T>[],
    data: T[],
    filename?: string
): void => {
    // Filter columns that should be included in export (default true if not specified)
    const exportColumns = columns.filter(col => col.includeInExport !== false);

    // Create header row
    const headers = exportColumns.map(col => col.header);
    let csvContent = headers.join(',') + '\n';

    // Process each data row
    data.forEach(item => {
        const row = exportColumns.map(column => {
            let cellValue;

            // Extract value using accessor
            if (typeof column.accessor === 'function') {
                cellValue = column.accessor(item);
            } else {
                cellValue = item[column.accessor as keyof T];
            }

            // Format cell value for CSV
            if (cellValue === null || cellValue === undefined) {
                return '';
            }

            // Escape quotes and wrap in quotes if the value contains commas or quotes
            const stringValue = String(cellValue);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }

            return stringValue;
        });

        csvContent += row.join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Set filename with date if not provided
    const defaultFilename = `export-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename || defaultFilename);
    link.style.visibility = 'hidden';

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
};