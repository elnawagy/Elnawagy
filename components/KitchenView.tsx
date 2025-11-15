import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import type { KitchenOrder } from '../types';
import { SearchIcon } from './icons';

export const KitchenView: React.FC = () => {
    const { kitchenOrders, loading, branches, currentBranchId } = useSystem();
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useLocalization();

    const currentBranch = useMemo(() => branches.find(b => b.id === currentBranchId), [branches, currentBranchId]);

    const filteredOrders = useMemo(() => {
        if (!currentBranch) return [];
        return kitchenOrders.filter(order =>
            order.destinationBranch === currentBranch.name &&
            (order.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [kitchenOrders, searchTerm, currentBranch]);

    const getStatusColor = (status: KitchenOrder['status']) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">{t('kitchen_management')}</h1>
                    <p className="mt-2 text-muted-foreground">{t('kitchen_subtitle')}</p>
                </div>
            </div>

            <div className="mt-6 p-4 rounded-xl border border-border bg-card shadow-sm">
                <div className="relative mb-4">
                    <SearchIcon className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t('search_kitchen_orders')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-secondary border-border rounded-md shadow-sm p-2 ltr:pl-10 rtl:pr-10 focus:ring-primary focus:border-primary"
                    />
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-foreground">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('order_id')}</th>
                                <th scope="col" className="px-6 py-3">{t('destination_branch')}</th>
                                <th scope="col" className="px-6 py-3">{t('items')}</th>
                                <th scope="col" className="px-6 py-3">{t('prep_time')}</th>
                                <th scope="col" className="px-6 py-3">{t('prep_status')}</th>
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
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="bg-card border-b border-border hover:bg-secondary transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                                        <td className="px-6 py-4 font-medium">{order.destinationBranch}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{order.items}</td>
                                        <td className="px-6 py-4">{order.prepTime}</td>
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
                        No kitchen orders found.
                    </div>
                )}
            </div>
        </div>
    );
};