import React from 'react';

export interface Column<T> {
    header: string;
    accessor: keyof T;
    render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
}

export const Table = <T extends { id: string },>(
    { columns, data }: TableProps<T>
) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={`${String(col.accessor)}-${index}`} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            {columns.map((col, index) => (
                                <td key={`${String(col.accessor)}-${index}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {col.render ? col.render(item) : (item[col.accessor] as React.ReactNode)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};