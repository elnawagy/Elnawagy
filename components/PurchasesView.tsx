

import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import { exportToPdf, exportToExcel, exportToCsv } from '../services/exportService';
import type { PurchaseOrder } from '../types';
import { SearchIcon, FilterIcon, PlusIcon, DownloadIcon, PdfIcon, CsvIcon, ExcelIcon, PurchasesIcon } from './icons';
import { EmptyState } from './EmptyState';

export const PurchasesView: React.FC = () => {
    const { purchaseOrders: allPurchaseOrders, loading, branches, currentBranchId } = useSystem();
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useLocalization();

    const currentBranch = useMemo(() => branches.find(b => b.id === currentBranchId), [branches, currentBranchId]);

    const purchaseOrders = useMemo(() => {
        if (!currentBranch) return allPurchaseOrders;
        return allPurchaseOrders.filter(p => p.branch === currentBranch.name);
    }, [allPurchaseOrders, currentBranch]);

    const filteredOrders = useMemo(() => {
        return purchaseOrders.filter(order =>
            order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [purchaseOrders, searchTerm]);

    const getStatusColor = (status: PurchaseOrder['status']) => {
        switch (status) {
            case 'Received': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Ordered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const headers = [t('order_id'), t('supplier'), t('branch'), t('amount'), t('date'), t('status')];
    const dataForExport = filteredOrders.map(order => ({
        [t('order_id')]: order.id,
        [t('supplier')]: order.supplier,
        [t('branch')]: order.branch,
        [t('amount')]: order.total,
        [t('date')]: order.date,
        [t('status')]: order.status,
    }));
    
    const AddPurchaseButton = () => (
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
            <PlusIcon />
            {t('add_purchase')}
        </button>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">{t('purchases_management')}</h1>
                    <p className="mt-2 text-muted-foreground">{t('purchases_subtitle')}</p>
                </div>
                <AddPurchaseButton />
            </div>

            <div className="mt-6 p-4 rounded-xl border border-border bg-card shadow-sm">
                {purchaseOrders.length > 0 ? (
                    <>
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="relative flex-grow">
                                <SearchIcon className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={t('search_purchases')}
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
                                    <button onClick={() => exportToPdf(dataForExport, headers, t('purchases_management'), 'purchases_report')} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><PdfIcon/> {t('export_as_pdf')}</button>
                                    <button onClick={() => exportToCsv(dataForExport, 'purchases_report')} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><CsvIcon/> {t('export_as_csv')}</button>
                                    <button onClick={() => exportToExcel(dataForExport, 'purchases_report')} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><ExcelIcon/> {t('export_as_excel')}</button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-foreground">
                                <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t('order_id')}</th>
                                        <th scope="col" className="px-6 py-3">{t('supplier')}</th>
                                        <th scope="col" className="px-6 py-3">{t('branch')}</th>
                                        <th scope="col" className="px-6 py-3">{t('amount')}</th>
                                        <th scope="col" className="px-6 py-3">{t('date')}</th>
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
                                        filteredOrders.map(order => (
                                            <tr key={order.id} className="bg-card border-b border-border hover:bg-secondary transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                                                <td className="px-6 py-4 font-medium whitespace-nowrap">{order.supplier}</td>
                                                <td className="px-6 py-4">{order.branch}</td>
                                                <td className="px-6 py-4">EGP {order.total.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{new Date(order.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="px-3 py-1 bg-secondary text-sm font-semibold rounded-md hover:bg-accent transition-colors">
                                                        {t('view_short')}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                         {filteredOrders.length === 0 && !loading && (
                            <div className="text-center py-8 text-muted-foreground">
                                {t('no_purchases_found')}
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={<PurchasesIcon />}
                        title={t('no_purchases_found')}
                        description={t('empty_state_purchases_desc')}
                        actionButton={<AddPurchaseButton />}
                    />
                )}
            </div>
        </div>
    );
};