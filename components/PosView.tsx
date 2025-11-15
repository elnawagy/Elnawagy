import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import type { PosItem, MenuItem as MenuItemType, Table, Customer, Order } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import { useNotifications } from '../hooks/useNotifications';
import { PlusIcon, MinusIcon, TrashIcon, SearchIcon, GridViewIcon, FloorPlanIcon, SplitBillIcon, MergeTablesIcon, AddCustomerIcon, PrintIcon, EmailIcon, GiftCardIcon } from './icons';
import { Modal } from './Modal';
import { CustomerSearchModal } from './CustomerSearchModal';

const TAX_RATE = 0.14; // 14% VAT

const initialTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
    id: `T${i + 1}`,
    name: `Table ${i + 1}`,
    status: 'Available',
    orderId: null
}));

export const PosView: React.FC = () => {
    const { t } = useLocalization();
    const { menuItems, customers } = useSystem();
    const { addNotification } = useNotifications();

    const [viewMode, setViewMode] = useState<'grid' | 'floor'>('grid');
    const [activeCategory, setActiveCategory] = useState("Main Courses");
    const [searchTerm, setSearchTerm] = useState('');
    
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [activeTableId, setActiveTableId] = useState<string | null>(null);
    const [tables, setTables] = useState<Table[]>(initialTables);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);

    const categories = useMemo(() => [...new Set(menuItems.map(item => item.category))], [menuItems]);
    
    useEffect(() => {
        if (categories.length > 0 && !categories.includes(activeCategory)) {
            setActiveCategory(categories[0]);
        }
    }, [categories, activeCategory]);

    const activeOrder = useMemo(() => activeOrders.find(o => o.tableId === activeTableId && o.status === 'active'), [activeOrders, activeTableId]);
    const selectedCustomer = useMemo(() => customers.find(c => c.id === activeOrder?.customerId), [customers, activeOrder]);

    const tablesWithStatus = useMemo(() => {
        return tables.map(t => {
            const order = activeOrders.find(o => o.tableId === t.id && o.status === 'active');
            return { ...t, status: order ? 'Occupied' : 'Available' };
        });
    }, [tables, activeOrders]);

    const handleTableSelect = (tableId: string) => {
        const existingOrder = activeOrders.find(o => o.tableId === tableId && o.status === 'active');
        if (existingOrder) {
            setActiveTableId(tableId);
        } else {
            const newOrder: Order = {
                id: `ORD-${Date.now()}`,
                tableId,
                customerId: null,
                items: [],
                subtotal: 0,
                tax: 0,
                total: 0,
                status: 'active',
            };
            setActiveOrders(prev => [...prev, newOrder]);
            setActiveTableId(tableId);
            addNotification(`${t('new_order_for_table')} ${tableId}`, 'info');
        }
    };
    
    const updateOrderCalculations = (items: PosItem[]): Pick<Order, 'subtotal' | 'tax' | 'total'> => {
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };

    const updateActiveOrder = (updatedItems: PosItem[]) => {
        if (!activeOrder) return;
        const calculations = updateOrderCalculations(updatedItems);
        setActiveOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...o, items: updatedItems, ...calculations } : o));
    };

    const addToOrder = (item: MenuItemType) => {
        if (!activeOrder) {
            addNotification(t('no_active_order'), 'warning');
            return;
        }
        const existingItem = activeOrder.items.find(oi => oi.id === item.id);
        let updatedItems;
        if (existingItem) {
            updatedItems = activeOrder.items.map(oi => oi.id === item.id ? { ...oi, quantity: oi.quantity + 1 } : oi);
        } else {
            updatedItems = [...activeOrder.items, { ...item, orderItemId: Date.now(), quantity: 1 }];
        }
        updateActiveOrder(updatedItems);
    };

    const updateQuantity = (orderItemId: number, delta: number) => {
        if (!activeOrder) return;
        const newItems = activeOrder.items.map(item => item.orderItemId === orderItemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item);
        const filteredItems = newItems.filter(item => item.quantity > 0);
        updateActiveOrder(filteredItems);
    };
    
    const removeFromOrder = (orderItemId: number) => {
        if (!activeOrder) return;
        const updatedItems = activeOrder.items.filter(item => item.orderItemId !== orderItemId);
        updateActiveOrder(updatedItems);
    };

    const handleSelectCustomer = (customerId: string) => {
        if (!activeOrder) return;
        setActiveOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...o, customerId } : o));
        setShowCustomerSearch(false);
    };
    
    const handlePayment = () => {
        if (!activeOrder || activeOrder.items.length === 0) return;
        setShowPaymentModal(true);
    };

    const handleConfirmPayment = () => {
        if (!activeOrder) return;
        setActiveOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...o, status: 'paid' } : o));
        setActiveTableId(null);
        setShowPaymentModal(false);
        addNotification(t('order_paid_success'), 'success');
    };

    const filteredItems = menuItems.filter(item =>
        item.category === activeCategory &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const getTableStatusColor = (status: Table['status']) => {
        switch (status) {
            case 'Available': return 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300';
            case 'Occupied': return 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-300';
            case 'Reserved': return 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300';
        }
    };
    
    const PaymentModalContent: React.FC = () => {
        const [amountReceived, setAmountReceived] = useState<number | ''>('');
        if (!activeOrder) return null;

        const change = (typeof amountReceived === 'number' ? amountReceived : 0) - activeOrder.total;

        return (
            <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-lg text-center">
                    <p className="text-muted-foreground">{t('order_total')}</p>
                    <p className="text-4xl font-bold">EGP {activeOrder.total.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button className="w-full bg-green-600/20 border border-green-600 text-green-700 dark:text-green-300 py-3 rounded-lg font-semibold">{t('cash')}</button>
                    <button className="w-full bg-blue-600/20 border border-blue-600 text-blue-700 dark:text-blue-300 py-3 rounded-lg font-semibold">{t('card')}</button>
                </div>
                 <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('amount_received')}</label>
                    <input
                        type="number"
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="mt-1 block w-full bg-background border-border rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary text-lg text-center font-semibold"
                        placeholder="0.00"
                    />
                </div>
                {typeof amountReceived === 'number' && amountReceived >= activeOrder.total && (
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-center">
                        <p className="text-sm text-blue-800 dark:text-blue-300">{t('change_due')}</p>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">EGP {change.toFixed(2)}</p>
                    </div>
                )}
                <button
                    onClick={handleConfirmPayment}
                    disabled={!activeOrder || activeOrder.items.length === 0}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
                >
                    {t('confirm_payment')}
                </button>
            </div>
        );
    };


    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-81px)] bg-background">
            {showPaymentModal && <Modal title={t('payment')} onClose={() => setShowPaymentModal(false)}><PaymentModalContent /></Modal>}
            {showCustomerSearch && <CustomerSearchModal onClose={() => setShowCustomerSearch(false)} onSelectCustomer={handleSelectCustomer} />}

            <div className="flex-grow p-4 overflow-y-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-grow">
                         <SearchIcon className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={t('search_items')}
                            className="w-full p-2 ltr:pl-10 rtl:pr-10 rounded-md bg-secondary border-border focus:ring-primary focus:border-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center bg-secondary rounded-md p-1">
                        <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 ${viewMode==='grid' ? 'bg-primary text-primary-foreground' : ''}`}><GridViewIcon/> {t('grid_view')}</button>
                        <button onClick={() => setViewMode('floor')} className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 ${viewMode==='floor' ? 'bg-primary text-primary-foreground' : ''}`}><FloorPlanIcon/> {t('floor_plan')}</button>
                    </div>
                </div>
                {viewMode === 'grid' ? (
                    <>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                        activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredItems.map(item => (
                                <div key={item.id} onClick={() => addToOrder(item)} className="cursor-pointer bg-card p-4 rounded-lg shadow-sm border border-border hover:border-primary hover:shadow-lg transition-all flex flex-col items-center text-center">
                                    <img src={`https://picsum.photos/seed/${item.id}/150`} alt={item.name} className="w-24 h-24 rounded-md object-cover mb-2" />
                                    <h3 className="font-semibold text-sm">{item.name}</h3>
                                    <p className="text-muted-foreground text-xs">EGP {item.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {tablesWithStatus.map(table => (
                            <div key={table.id} onClick={() => handleTableSelect(table.id)} className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center justify-center aspect-square transition-all hover:scale-105 ${getTableStatusColor(table.status)} ${activeTableId === table.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                                <span className="font-bold text-lg">{table.name}</span>
                                <span className="text-xs">{t(table.status.toLowerCase() as any)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-full lg:w-96 lg:max-w-sm flex-shrink-0 bg-card border-t lg:border-t-0 lg:border-s border-border flex flex-col">
                <div className="p-3 border-b border-border">
                    <div className="flex gap-2 items-center">
                        <div className="flex-grow p-2 rounded-md bg-secondary border-border text-sm">
                            {selectedCustomer ? (
                                <div>
                                    <p className="font-semibold">{selectedCustomer.name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedCustomer.loyaltyPoints} {t('loyalty_points')}</p>
                                </div>
                            ) : t('walk_in_customer')}
                        </div>
                        <button onClick={() => setShowCustomerSearch(true)} className="p-2 rounded-md bg-secondary border-border hover:bg-accent"><AddCustomerIcon/></button>
                    </div>
                </div>
                <div className="p-4 flex-grow overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">{t('your_order')} {activeTableId && `- ${activeTableId}`}</h2>
                    {!activeOrder ? (
                        <p className="text-muted-foreground text-center mt-8">{t('no_active_order')}</p>
                    ) : activeOrder.items.length === 0 ? (
                        <p className="text-muted-foreground text-center mt-8">Your order is empty.</p>
                    ) : (
                        <ul className="space-y-2">
                            {activeOrder.items.map(item => (
                                <li key={item.orderItemId} className="bg-secondary p-2 rounded-md">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-sm">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">EGP {item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQuantity(item.orderItemId, -1)} className="p-2 rounded-md bg-card hover:bg-accent"><MinusIcon /></button>
                                            <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.orderItemId, 1)} className="p-2 rounded-md bg-card hover:bg-accent"><PlusIcon /></button>
                                            <button onClick={() => removeFromOrder(item.orderItemId)} className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon /></button>
                                        </div>
                                    </div>
                                    <div className="mt-1">
                                        <input type="text" placeholder={t('order_notes_placeholder')} className="text-xs p-1 w-full bg-card rounded border-border"/>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="p-4 border-t border-border bg-secondary/50 space-y-3">
                    {activeOrder && (
                        <>
                            <div className="flex justify-between text-sm">
                                <span>{t('subtotal')}</span>
                                <span className="font-mono">EGP {activeOrder.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>{t('tax')}</span>
                                <span className="font-mono">EGP {activeOrder.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                                <span>{t('order_total')}</span>
                                <span className="font-mono">EGP {activeOrder.total.toFixed(2)}</span>
                            </div>
                        </>
                    )}
                    <button
                        onClick={handlePayment}
                        disabled={!activeOrder || activeOrder.items.length === 0}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('pay_now')}
                    </button>
                </div>
            </div>
        </div>
    );
};