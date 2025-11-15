import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import { usePermissions } from '../hooks/usePermissions';
import { 
    generateDashboardKpis, 
    generateSalesDashboardData,
    generateHRDashboardData,
    generateLowStockItemsData,
    generateRecentInvoices,
    generateNewHiresAndBirthdays,
    interpretAiCommand,
    generatePredictiveAnalysis
} from '../services/geminiService';
import type { KPI, SalesDashboardData, HRDashboardKPIs, InventoryItem, Invoice, Employee } from '../types';
import { 
    ChevronUpIcon, ChevronDownIcon, AIIcon, DashboardIcon, SalesIcon, HRIcon, 
    InventoryIcon, PosIcon, BellIcon, OrgChartIcon, LeaveIcon, BirthdayIcon, QuotationIcon 
} from './icons';
import { useNotifications } from '../hooks/useNotifications';

// --- Reusable Components ---
const KPICard: React.FC<{ kpi: KPI }> = ({ kpi }) => {
    const { t } = useLocalization();
    const isIncrease = kpi.changeType === 'increase';
    const titleKey = kpi.title.toLowerCase().replace(/\./g, '').replace(/\s/g, '_') as any;

    return (
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">{t(titleKey, kpi.title)}</h3>
            <p className="mt-1 text-3xl font-bold text-foreground">{kpi.value}</p>
            <div className={`mt-2 flex items-center text-sm ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                {isIncrease ? <ChevronUpIcon /> : <ChevronDownIcon />}
                <span className="mx-1">{kpi.change}</span>
            </div>
        </div>
    );
};

const DashboardCard: React.FC<{ title: string, icon: ReactNode, children: ReactNode, className?: string }> = ({ title, icon, children, className }) => (
    <div className={`p-4 sm:p-6 rounded-xl border border-border bg-card shadow-sm ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            <div className="text-primary">{icon}</div>
            <h2 className="font-bold text-lg text-foreground">{title}</h2>
        </div>
        {children}
    </div>
);

const SkeletonLoader: React.FC<{ className?: string }> = ({ className }) => <div className={`bg-secondary rounded animate-pulse ${className}`}></div>;


const PredictiveAnalysisCard: React.FC = () => {
    const { t } = useLocalization();
    const { sales } = useSystem();
    const [prediction, setPrediction] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePredict = async () => {
        setIsLoading(true);
        setPrediction('');
        const result = await generatePredictiveAnalysis(t('predictive_analysis_prompt'), sales);
        setPrediction(result);
        setIsLoading(false);
    };

    return (
        <DashboardCard title={t('predictive_analysis')} icon={<AIIcon />}>
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-grow md:w-2/3">
                    {isLoading ? (
                        <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-secondary rounded w-5/6"></div>
                            <div className="h-4 bg-secondary rounded w-3/4"></div>
                            <div className="h-4 bg-secondary rounded w-4/6"></div>
                        </div>
                    ) : prediction ? (
                         <div className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: prediction.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    ) : (
                         <p className="text-sm text-muted-foreground">{t('predictive_analysis_prompt')}</p>
                    )}
                </div>
                 <div className="flex-shrink-0 md:w-1/3 w-full">
                    <button
                        onClick={handlePredict}
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isLoading ? t('generating_prediction') : t('predict')}
                    </button>
                </div>
            </div>
        </DashboardCard>
    );
};


// --- Tab Components ---
const OverviewTab: React.FC = () => {
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [loadingKpis, setLoadingKpis] = useState(true);
    const [salesFilter, setSalesFilter] = useState('today');
    const { t } = useLocalization();
    const { branches, sales, menuItems, employees, currentBranchId } = useSystem();

    const currentBranch = useMemo(() => branches.find(b => b.id === currentBranchId), [branches, currentBranchId]);

    useEffect(() => {
        const fetchKpis = async () => {
            if (!currentBranch) return;
            setLoadingKpis(true);
            const data = await generateDashboardKpis(currentBranch.name);
            setKpis(data);
            setLoadingKpis(false);
        };
        fetchKpis();
    }, [currentBranch]);
    
    const branchPerformanceData = useMemo(() => {
        if (!currentBranch) return [];
        const salesForBranch = sales.filter(s => s.branch === currentBranch.name);
        const totalSales = salesForBranch.reduce((sum, s) => sum + s.total, 0);
        const orderCount = salesForBranch.length;
        const avgOrder = orderCount > 0 ? totalSales / orderCount : 0;
        return [{
            name: currentBranch.name,
            sales: totalSales,
            orders: orderCount,
            avg: avgOrder
        }];
    }, [currentBranch, sales]);

    const liveOrders = useMemo(() => {
        if (!currentBranch) return [];
        return sales.filter(s => s.branch === currentBranch.name)
            .slice(0, 3)
            .map(s => ({
                id: s.id,
                branch: s.branch,
                total: s.total,
                time: `${Math.floor(Math.random() * 10) + 1} min ago`
            }));
    }, [sales, currentBranch]);

    const topProducts = menuItems.slice(0, 2).map(p => ({name: p.name, sales: Math.floor(Math.random() * 5000) + 2000}));
    
    const topEmployees = useMemo(() => {
        if (!currentBranch) return [];
        return employees.filter(e => e.branch === currentBranch.name)
            .slice(0, 2)
            .map(e => ({ name: e.name, sales: Math.floor(Math.random() * 8000) + 5000 }));
    }, [employees, currentBranch]);


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loadingKpis ? [...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-32" />)
                    : kpis.map((kpi, index) => <KPICard key={index} kpi={kpi} />)}
            </div>
            
            <DashboardCard title={t('sales_summary')} icon={<SalesIcon/>}>
                <div className="flex justify-end gap-2 mb-2">
                    {[{key:'today', label:t('today')}, {key:'this_week', label:t('this_week')}, {key:'this_month', label:t('this_month')}].map(f => (
                         <button key={f.key} onClick={() => setSalesFilter(f.key)} className={`px-4 py-2 text-sm font-semibold rounded-lg ${salesFilter === f.key ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{f.label}</button>
                    ))}
                </div>
                <div className="h-64 bg-secondary rounded-md flex items-center justify-center"><p className="text-muted-foreground">Chart Placeholder for {currentBranch?.name}</p></div>
            </DashboardCard>
            
             <AiCommandBar />

             <PredictiveAnalysisCard />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DashboardCard title={t('branch_performance')} icon={<HRIcon />} className="lg:col-span-2">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                           <thead className="text-left rtl:text-right text-muted-foreground"><tr><th className="p-2">{t('branch')}</th><th className="p-2">{t('sales')}</th><th className="p-2">{t('orders')}</th><th className="p-2">{t('avg_order')}</th></tr></thead>
                           <tbody>
                            {branchPerformanceData.map(b => (
                                <tr key={b.name} className="border-t border-border"><td className="p-2 font-semibold">{b.name}</td><td className="p-2">EGP {b.sales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td><td className="p-2">{b.orders}</td><td className="p-2">EGP {b.avg.toFixed(2)}</td></tr>
                            ))}
                           </tbody>
                        </table>
                     </div>
                </DashboardCard>
                <DashboardCard title={t('live_order_feed')} icon={<PosIcon />}>
                    <ul className="space-y-3">
                        {liveOrders.map(o => (
                             <li key={o.id} className="flex justify-between items-center text-sm"><span className="font-semibold">{o.id}</span> <span className="text-muted-foreground">{o.branch}</span> <span className="font-mono">EGP {o.total}</span></li>
                        ))}
                    </ul>
                </DashboardCard>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <DashboardCard title={t('top_selling_products')} icon={<InventoryIcon />}>
                     <ul className="space-y-2">{topProducts.map(p=>(<li key={p.name} className="flex justify-between text-sm"><span className="font-medium">{p.name}</span> <span className="text-muted-foreground">EGP {p.sales.toLocaleString()}</span></li>))}</ul>
                </DashboardCard>
                 <DashboardCard title={t('top_employees')} icon={<HRIcon />}>
                    <ul className="space-y-2">{topEmployees.map(e=>(<li key={e.name} className="flex justify-between text-sm"><span className="font-medium">{e.name}</span> <span className="text-muted-foreground">EGP {e.sales.toLocaleString()}</span></li>))}</ul>
                </DashboardCard>
            </div>
        </div>
    );
};

const AiCommandBar = () => {
    const { t } = useLocalization();
    const { setView } = useSystem();
    const { addNotification } = useNotifications();
    const [command, setCommand] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;

        setIsProcessing(true);
        addNotification(t('ai_command_executing'), 'info');
        const result = await interpretAiCommand(command);
        
        if (result && !result.error && result.view) {
            setView(result.view, result.filters || {});
        } else {
            addNotification(t('ai_command_unrecognized'), 'error');
        }
        
        setCommand('');
        setIsProcessing(false);
    }
    
    return (
        <form onSubmit={handleCommand} className="relative">
             <AIIcon className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-muted-foreground" />
             <input
                 type="text"
                 value={command}
                 onChange={e => setCommand(e.target.value)}
                 disabled={isProcessing}
                 placeholder={t('ask_ai_about_data')}
                 className="w-full bg-card border-border rounded-lg shadow-sm p-3 ltr:pl-10 rtl:pr-10 focus:ring-primary focus:border-primary transition-shadow hover:shadow-md disabled:opacity-50"
             />
         </form>
    );
};


const SalesHubTab: React.FC = () => {
    const {t} = useLocalization();
    const [data, setData] = useState<SalesDashboardData | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [dashboardData, invoicesData] = await Promise.all([generateSalesDashboardData(), generateRecentInvoices()]);
            setData(dashboardData);
            setInvoices(invoicesData);
            setLoading(false);
        }
        fetchData();
    }, [])

    const totalInvoices = useMemo(() => {
        if (!data?.invoiceStatusCounts) {
            return 0;
        }
        // FIX: The `reduce` function was missing an initial value, causing the accumulator `sum` to be of type `unknown`
        // when `Object.values` returns `unknown[]`. Adding `0` as the initial value ensures `sum` is a number.
        return Object.values(data.invoiceStatusCounts).reduce((sum: number, count) => sum + (Number(count) || 0), 0);
    }, [data]);

    const kpiData = [
        {title: t('total_revenue'), value: `EGP ${data?.totalRevenue.toLocaleString()}`},
        {title: t('unpaid_invoices'), value: data?.unpaidInvoices},
        {title: t('overdue_amount'), value: `EGP ${data?.overdueAmount.toLocaleString()}`},
    ];

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {loading ? [...Array(3)].map((_, i) => <SkeletonLoader key={i} className="h-24"/>) : kpiData.map(kpi => (
                     <div key={kpi.title} className="p-4 rounded-xl border border-border bg-card shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground">{kpi.title}</h3>
                        <p className="mt-1 text-3xl font-bold text-foreground">{kpi.value}</p>
                    </div>
                ))}
             </div>
             <DashboardCard title={t('invoice_status_overview')} icon={<SalesIcon />}>
                 {loading ? <SkeletonLoader className="h-8 w-full" /> : (
                    <div className="flex rounded-full overflow-hidden h-8 bg-secondary">
                        {Object.entries(data?.invoiceStatusCounts || {}).map(([status, count]) => (
                            // FIX: Cast count to number for arithmetic operation
                            <div key={status} className={`flex items-center justify-center text-xs text-white font-bold ${status === 'Paid' ? 'bg-green-500' : status === 'Overdue' ? 'bg-red-500' : 'bg-yellow-500'}`} style={{width: `${totalInvoices > 0 ? (((Number(count) || 0) / totalInvoices) * 100) : 0}%`}}> {status} </div>
                        ))}
                    </div>
                 )}
             </DashboardCard>
             <DashboardCard title={t('recent_invoices')} icon={<QuotationIcon />}>
                 {loading ? <SkeletonLoader className="h-40 w-full" /> : (
                    <ul className="space-y-2">{invoices.map(inv=>(<li key={inv.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-secondary"><span className="font-semibold">{inv.id}</span><span>{inv.customerName}</span><span>EGP {inv.total.toLocaleString()}</span><span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600">{inv.status}</span></li>))}</ul>
                 )}
             </DashboardCard>
        </div>
    )
};

const HRHubTab: React.FC = () => {
    const {t} = useLocalization();
    const [data, setData] = useState<HRDashboardKPIs | null>(null);
    const [team, setTeam] = useState<{newHires: Employee[], birthdays: Employee[]}>({newHires: [], birthdays: []});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [dashboardData, teamData] = await Promise.all([generateHRDashboardData(), generateNewHiresAndBirthdays()]);
            setData(dashboardData);
            setTeam(teamData);
            setLoading(false);
        }
        fetchData();
    }, []);

    const kpiData = [
        {title: t('total_employees'), value: data?.headcount},
        {title: t('turnover_rate'), value: `${data?.turnoverRate}%`},
        {title: t('attendance_rate'), value: `${data?.attendanceRate}%`},
        {title: t('pending_requests'), value: data?.pendingLeaveRequests},
    ];
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {loading ? [...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-24"/>) : kpiData.map(kpi => (
                     <div key={kpi.title} className="p-4 rounded-xl border border-border bg-card shadow-sm text-center">
                        <h3 className="text-sm font-medium text-muted-foreground">{kpi.title}</h3>
                        <p className="mt-1 text-4xl font-bold text-primary">{kpi.value}</p>
                    </div>
                ))}
            </div>
             <DashboardCard title={t('quick_links')} icon={<HRIcon />}>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[{label:t('view_all_employees'), Icon:HRIcon}, {label:t('manage_leave'), Icon:LeaveIcon}, {label:t('view_org_chart'), Icon:OrgChartIcon}, {label:t('add_employee'), Icon:HRIcon}].map(link => (
                        <button key={link.label} className="p-4 bg-secondary rounded-lg font-semibold hover:bg-accent flex flex-col items-center gap-2"><link.Icon/>{link.label}</button>
                    ))}
                 </div>
             </DashboardCard>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <DashboardCard title={t('new_hires')} icon={<HRIcon/>}>
                     {loading ? <SkeletonLoader className="h-20 w-full"/> : (
                         <ul className="space-y-2">{team.newHires.map(e => (<li key={e.id} className="text-sm p-2 rounded-md hover:bg-secondary flex justify-between"><span>{e.name}</span><span className="text-muted-foreground">{e.position}</span></li>))}</ul>
                     )}
                 </DashboardCard>
                 <DashboardCard title={t('upcoming_birthdays')} icon={<BirthdayIcon />}>
                      {loading ? <SkeletonLoader className="h-20 w-full"/> : (
                         <ul className="space-y-2">{team.birthdays.map(e => (<li key={e.id} className="text-sm p-2 rounded-md hover:bg-secondary flex justify-between"><span>{e.name}</span><span className="text-muted-foreground">{e.position}</span></li>))}</ul>
                     )}
                 </DashboardCard>
             </div>
        </div>
    )
};

const InventoryHubTab: React.FC = () => {
    const {t} = useLocalization();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await generateLowStockItemsData();
            setItems(data);
            setLoading(false);
        }
        fetchData();
    }, []);

    return (
         <div className="space-y-6">
            <DashboardCard title={t('low_stock_items')} icon={<BellIcon />}>
                {loading ? <SkeletonLoader className="h-40 w-full"/> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left rtl:text-right text-muted-foreground"><tr><th className="p-2">{t('item_name')}</th><th className="p-2">{t('stock_level')}</th><th className="p-2">{t('reorder_level')}</th></tr></thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id} className="border-t border-border"><td className="p-2 font-semibold">{item.name}</td><td className="p-2 text-red-500 font-bold">{item.stock}</td><td className="p-2">{item.reorderLevel}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </DashboardCard>
        </div>
    )
};


// --- Main Dashboard Component ---
export const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { t } = useLocalization();
    const { hasPermission } = usePermissions();

    const availableTabs = useMemo(() => [
        { id: 'overview', label: t('overview'), icon: DashboardIcon, permission: hasPermission('dashboard', 'view') },
        { id: 'sales_hub', label: t('sales_hub'), icon: SalesIcon, permission: hasPermission('sales', 'view') },
        { id: 'hr_hub', label: t('hr_hub'), icon: HRIcon, permission: hasPermission('hr', 'view') },
        { id: 'inventory_hub', label: t('inventory_hub'), icon: InventoryIcon, permission: hasPermission('inventory', 'view') },
    ].filter(tab => tab.permission), [t, hasPermission]);

    useEffect(() => {
        if (!availableTabs.find(tab => tab.id === activeTab)) {
            setActiveTab(availableTabs[0]?.id || 'overview');
        }
    }, [availableTabs, activeTab]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="border-b border-border mb-4">
                <nav className="-mb-px flex space-x-4 rtl:space-x-reverse overflow-x-auto">
                    {availableTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-sm transition-colors ${
                                activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                            }`}
                        >
                            <tab.icon />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div>
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'sales_hub' && <SalesHubTab />}
                {activeTab === 'hr_hub' && <HRHubTab />}
                {activeTab === 'inventory_hub' && <InventoryHubTab />}
            </div>
        </div>
    );
};
