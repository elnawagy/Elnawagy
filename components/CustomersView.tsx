
import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import { exportToPdf, exportToExcel, exportToCsv } from '../services/exportService';
import type { Customer } from '../types';
import { SearchIcon, FilterIcon, PlusIcon, DownloadIcon, PdfIcon, CsvIcon, ExcelIcon, CustomersIcon } from './icons';
import { EmptyState } from './EmptyState';

export const CustomersView: React.FC = () => {
    const { customers, loading } = useSystem();
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useLocalization();

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm)
        );
    }, [customers, searchTerm]);

    const headers = [t('name'), t('email'), t('phone'), t('loyalty_points'), t('last_order')];
    const dataForExport = filteredCustomers.map(customer => ({
        [t('name')]: customer.name,
        [t('email')]: customer.email,
        [t('phone')]: customer.phone,
        [t('loyalty_points')]: customer.loyaltyPoints,
        [t('last_order')]: customer.lastOrderDate,
    }));
    
    const AddCustomerButton = () => (
         <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
            <PlusIcon />
            {t('add_customer')}
        </button>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">{t('customer_management')}</h1>
                    <p className="mt-2 text-muted-foreground">{t('customer_subtitle')}</p>
                </div>
                <AddCustomerButton />
            </div>

            <div className="mt-6 p-4 rounded-xl border border-border bg-card shadow-sm">
                 {customers.length > 0 ? (
                    <>
                         <div className="flex flex-col md:flex-row gap-4 mb-4">
                             <div className="relative flex-grow">
                                <SearchIcon className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={t('search_customers')}
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
                                    <button onClick={() => exportToPdf(dataForExport, headers, t('customer_management'), 'customers_report')} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><PdfIcon/> {t('export_as_pdf')}</button>
                                    <button onClick={() => exportToCsv(dataForExport, 'customers_report')} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><CsvIcon/> {t('export_as_csv')}</button>
                                    <button onClick={() => exportToExcel(dataForExport, 'customers_report')} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><ExcelIcon/> {t('export_as_excel')}</button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-foreground">
                                <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t('name')}</th>
                                        <th scope="col" className="px-6 py-3">{t('email')}</th>
                                        <th scope="col" className="px-6 py-3">{t('phone')}</th>
                                        <th scope="col" className="px-6 py-3">{t('loyalty_points')}</th>
                                        <th scope="col" className="px-6 py-3">{t('last_order')}</th>
                                        <th scope="col" className="px-6 py-3">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="bg-card border-b border-border animate-pulse">
                                                {[...Array(6)].map((_, c) => <td key={c} className="px-6 py-4"><div className="h-4 bg-secondary rounded w-3/4"></div></td>)}
                                            </tr>
                                        ))
                                    ) : (
                                        filteredCustomers.map(customer => (
                                            <tr key={customer.id} className="bg-card border-b border-border hover:bg-secondary transition-colors">
                                                <td className="px-6 py-4 font-medium whitespace-nowrap">{customer.name}</td>
                                                <td className="px-6 py-4">{customer.email}</td>
                                                <td className="px-6 py-4">{customer.phone}</td>
                                                <td className="px-6 py-4 font-semibold">{customer.loyaltyPoints.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{customer.lastOrderDate}</td>
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
                         {filteredCustomers.length === 0 && !loading && (
                            <div className="text-center py-8 text-muted-foreground">
                                {t('no_customers_found')}
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={<CustomersIcon />}
                        title={t('no_customers_found')}
                        description={t('empty_state_customers_desc')}
                        actionButton={<AddCustomerButton />}
                    />
                )}
            </div>
        </div>
    );
};