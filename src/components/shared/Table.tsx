import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
    header: string;
    accessor: keyof T;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    onSort?: (accessor: keyof T) => void;
    sortConfig?: { key: keyof T; direction: 'asc' | 'desc' } | null;
}

export const Table = <T extends { id: string },>(
    { columns, data, onSort, sortConfig }: TableProps<T>
) => {
    const handleSort = (accessor: keyof T) => {
        if (onSort) {
            onSort(accessor);
        }
    };

    const getSortIcon = (accessor: keyof T) => {
        if (!sortConfig || sortConfig.key !== accessor) {
            return <ChevronUp className="h-4 w-4 text-gray-400" />;
        }
        return sortConfig.direction === 'asc' ? 
            <ChevronUp className="h-4 w-4 text-blue-600" /> : 
            <ChevronDown className="h-4 w-4 text-blue-600" />;
    };

    return (
        <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                        {columns.map((col, index) => (
                            <th 
                                key={`${String(col.accessor)}-${index}`} 
                                scope="col" 
                                className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                                    col.sortable ? 'cursor-pointer hover:bg-gray-200 transition-colors duration-200' : ''
                                }`}
                                onClick={() => col.sortable && handleSort(col.accessor)}
                            >
                                <div className="flex items-center">
                                    <span>{col.header}</span>
                                    {col.sortable && (
                                        <span className="ml-1">
                                            {getSortIcon(col.accessor)}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item: any) => (
                        <tr key={item.id} className="hover:bg-blue-50 transition-colors duration-150">
                            {columns.map((col, index) => (
                                <td key={`${String(col.accessor)}-${index}`} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
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