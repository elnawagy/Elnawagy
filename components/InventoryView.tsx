

import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import { exportToPdf, exportToExcel, exportToCsv } from '../services/exportService';
import type { InventoryItem } from '../types';
import { SearchIcon, FilterIcon, PlusIcon, DownloadIcon, PdfIcon, CsvIcon, ExcelIcon, InventoryIcon } from './icons';
import { EmptyState } from './EmptyState';

export const InventoryView: React.FC = () => {
    const { inventoryItems: allInventoryItems, loading, branches, currentBranchId } = useSystem();
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useLocalization();

    const currentBranch = useMemo(() => branches.find(b => b.id === currentBranchId), [branches, currentBranchId]);

    const inventoryItems = useMemo(() => {
        if (!currentBranch) return allInventoryItems;
        return allInventoryItems.filter(i => i.branch === currentBranch.name);
    }, [allInventoryItems, currentBranch]);

    const filteredItems = useMemo(() => {
        return inventoryItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [inventoryItems, searchTerm]);

    const getStockStatus = (item: InventoryItem) => {
        if (item.stock <= 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
        if (item.stock <= item.reorderLevel) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
        return { text: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    };

    const headers = [t('item_name'), t('category'), t('stock_level'), t('reorder_level'), t('supplier'), t('status')];
    const dataForExport = filteredItems.map(item => ({
        [t('item_name')]: item.name,
        [t('category')]: item.category,
        [t('stock_level')]: item.stock,
        [t('reorder_level')]: item.reorderLevel,
        [t('supplier')]: item.supplier,
        [t('status')]: getStockStatus(item).text,
    }));
    
    const AddItemButton = () => (
         <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
            <PlusIcon />
            {t('add_item')}
        </button>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">{t('inventory_management')}</h1>
                    <p className="mt-2 text-muted-foreground">{t('inventory_subtitle')}</p>
                </div>
                <AddItemButton />
            </div>

            <div className="mt-6 p-4 rounded-xl border border-border bg-card shadow-sm">
                 {inventoryItems.length > 0 ? (
                    <>
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                             <div className="relative flex-grow">
                                <SearchIcon className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={t('search_inventory')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-secondary border-border rounded-md shadow-sm p-2 ltr:pl-10 rtl:pr-10 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg font-semibold hover:bg-accent transition-colors">
                                <FilterIcon />
                                Filters
                            </button>
                            <div className="relative group">
                                <button className="flex items-center justify-center gap-2 px-4 py-2 w-full md:w-auto bg-secondary text-secondary-foreground border border-border rounded-lg font-semibold hover:bg-accent transition-colors">
                                    <DownloadIcon />
                                    {t('export')}
                                </button>
                                <div className="absolute top-full ltr:right-0 rtl:left-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                                    <button onClick={() => exportToPdf(dataForExport, headers, t('inventory_management'), 'inventory_report')} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><PdfIcon/> {t('export_as_pdf')}</button>
                                    <button onClick={() => exportToCsv(dataForExport, 'inventory_report')} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><CsvIcon/> {t('export_as_csv')}</button>
                                    <button onClick={() => exportToExcel(dataForExport, 'inventory_report')} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><ExcelIcon/> {t('export_as_excel')}</button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-foreground">
                                <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t('item_name')}</th>
                                        <th scope="col" className="px-6 py-3">{t('category')}</th>
                                        <th scope="col" className="px-6 py-3">{t('stock_level')}</th>
                                        <th scope="col" className="px-6 py-3">{t('reorder_level')}</th>
                                        <th scope="col" className="px-6 py-3">{t('supplier')}</th>
                                        <th scope="col" className="px-6 py-3">{t('status')}</th>
                                        <th scope="col" className="px-6 py-3">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="bg-card border-b border-border animate-pulse">
                                                {[...Array(7)].map((_, c) => <td key={c} className="px-6 py-4"><div className="h-4 bg-secondary rounded w-3/4"></div></td>)}
                                            </tr>
                                        ))
                                    ) : (
                                        filteredItems.map(item => {
                                            const status = getStockStatus(item);
                                            return (
                                                <tr key={item.id} className="bg-card border-b border-border hover:bg-secondary transition-colors">
                                                    <td className="px-6 py-4 font-medium whitespace-nowrap">{item.name}</td>
                                                    <td className="px-6 py-4">{item.category}</td>
                                                    <td className="px-6 py-4 font-semibold">{item.stock.toFixed(2)}</td>
                                                    <td className="px-6 py-4">{item.reorderLevel.toLocaleString()}</td>
                                                    <td className="px-6 py-4">{item.supplier}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                                                            {status.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button className="px-3 py-1 bg-secondary text-sm font-semibold rounded-md hover:bg-accent transition-colors">
                                                            {t('view_short')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {filteredItems.length === 0 && !loading && (
                            <div className="text-center py-8 text-muted-foreground">
                                {t('no_inventory_items_found')}
                            </div>
                        )}
                    </>
                 ) : (
                    <EmptyState 
                        icon={<InventoryIcon />}
                        title={t('no_inventory_items_found')}
                        description={t('empty_state_inventory_desc')}
                        actionButton={<AddItemButton />}
                    />
                 )}
            </div>
        </div>
    );
};