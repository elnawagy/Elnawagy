import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import { generatePnlData, generatePnlInsights, generateWhatIfPnl } from '../services/geminiService';
import { exportToPdf, exportToExcel } from '../services/exportService';
import type { PnlEntry, FinancialRatio, DataSource } from '../types';
import { 
    ChevronDownIcon, ChevronUpIcon, AIIcon, BarChartIcon, PlusIcon, 
    PdfIcon, ExcelIcon, PnlIcon, CalendarIcon, BranchesIcon,
    PosIcon, InventoryIcon, HRIcon, CloseIcon, FxIcon
} from './icons';
import { Modal } from './Modal';
import { useNotifications } from '../hooks/useNotifications';

type ViewMode = 'standard' | 'comparison' | 'percentage' | 'budget';
type DateRange = 'month' | 'quarter' | 'year' | 'last_month';


const KpiCard: React.FC<{ ratio: FinancialRatio }> = ({ ratio }) => (
    <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
        <h4 className="font-semibold text-sm text-muted-foreground">{ratio.title}</h4>
        <p className="text-3xl font-bold text-primary mt-1">{ratio.value}</p>
        <p className="text-xs text-muted-foreground mt-2">{ratio.description}</p>
    </div>
);

const DataSourceIcon: React.FC<{ source?: DataSource }> = ({ source }) => {
    if (!source) return null;
    const iconMap: Record<DataSource, ReactNode> = {
        pos: <PosIcon />,
        inventory: <InventoryIcon />,
        hr: <HRIcon />,
        manual: <PnlIcon />,
    };
    return <div className="w-4 h-4 text-muted-foreground">{iconMap[source]}</div>;
};

// Main P&L View Component
export const PnlView: React.FC = () => {
    const { t } = useLocalization();
    const { branches, currentBranchId: globalBranchId, pnlData: initialPnlData, loading: initialLoading } = useSystem();
    
    const [loading, setLoading] = useState(initialLoading);
    const [pnlData, setPnlData] = useState<PnlEntry[]>(initialPnlData);
    const [dateRange, setDateRange] = useState<DateRange>('month');
    const [currentBranchId, setCurrentBranchId] = useState(globalBranchId);
    const [viewMode, setViewMode] = useState<ViewMode>('standard');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [insights, setInsights] = useState('');
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [isWhatIfModalOpen, setWhatIfModalOpen] = useState(false);

    const currentBranch = useMemo(() => branches.find(b => b.id === currentBranchId), [branches, currentBranchId]);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentBranch) return;
            setLoading(true);
            const data = await generatePnlData(currentBranch.name, dateRange);
            setPnlData(data);
            setLoading(false);
            // Auto-expand first level totals
            const initialExpanded = new Set<string>();
            data.forEach(entry => {
                if (entry.subRows && entry.subRows.length > 0) {
                    initialExpanded.add(entry.id);
                }
            });
            setExpandedRows(initialExpanded);
        };
        fetchData();
    }, [currentBranch, dateRange]);

    const handleGenerateInsights = async () => {
        setLoadingInsights(true);
        const result = await generatePnlInsights(pnlData);
        setInsights(result);
        setLoadingInsights(false);
    };

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    const flattenPnlDataForExport = (data: PnlEntry[], level = 0): any[] => {
        let rows: any[] = [];
        data.forEach(entry => {
            const prefix = ' '.repeat(level * 2);
            let rowData: any = { [t('account')]: `${prefix}${entry.title}` };
            
            if (viewMode === 'standard') {
                rowData[t('amount')] = entry.amount;
            } else if (viewMode === 'comparison') {
                rowData[t('current_period')] = entry.amount;
                rowData[t('previous_period')] = entry.previousAmount;
                const variance = (entry.amount || 0) - (entry.previousAmount || 0);
                rowData[t('variance')] = variance;
            } else if (viewMode === 'budget') {
                rowData[t('actual')] = entry.amount;
                rowData[t('budget')] = entry.budgetAmount;
                const variance = (entry.amount || 0) - (entry.budgetAmount || 0);
                rowData[t('variance')] = variance;
            }
            rows.push(rowData);

            if (entry.subRows) {
                rows = rows.concat(flattenPnlDataForExport(entry.subRows, level + 1));
            }
        });
        return rows;
    };
    
    const handleExportPdf = () => {
        const flatData = flattenPnlDataForExport(pnlData);
        const headers = Object.keys(flatData[0]);
        exportToPdf(flatData, headers, `${t('pnl_statement')} - ${currentBranch?.name}`, 'pnl_report');
    };

    const handleExportExcel = () => {
        const flatData = flattenPnlDataForExport(pnlData);
        exportToExcel(flatData, 'pnl_report');
    };


    const totalRevenue = pnlData.find(e => e.category === 'Revenue')?.amount || 0;
    const grossProfit = pnlData.find(e => e.category === 'Gross Profit')?.amount || 0;
    const netProfit = pnlData.find(e => e.category === 'Net Profit')?.amount || 0;
    const kpis: FinancialRatio[] = [
        { title: t('gross_profit_margin'), value: `${totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%`, description: t('gross_profit_margin_desc') },
        { title: t('net_profit_margin'), value: `${totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%`, description: t('net_profit_margin_desc') }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {isWhatIfModalOpen && <WhatIfModal basePnl={pnlData} onClose={() => setWhatIfModalOpen(false)} />}
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-foreground">{t('pnl_dashboard')}</h1>
                <p className="mt-2 text-muted-foreground">{t('pnl_subtitle')} - {currentBranch?.name}</p>
            </div>

            {/* Filters */}
            <div className="my-6 flex flex-wrap gap-4 items-center justify-between p-4 bg-card border border-border rounded-xl">
                <div className="flex flex-wrap gap-4">
                     <FilterDropdown icon={<CalendarIcon />} label={t('date_range')}>
                        <button onClick={() => setDateRange('month')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary rounded-md">{t('this_month')}</button>
                        <button onClick={() => setDateRange('last_month')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary rounded-md">{t('last_month')}</button>
                        <button onClick={() => setDateRange('quarter')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary rounded-md">{t('this_quarter')}</button>
                        <button onClick={() => setDateRange('year')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary rounded-md">{t('this_year')}</button>
                    </FilterDropdown>
                    <FilterDropdown icon={<BarChartIcon />} label={t('view_mode')}>
                        <button onClick={() => setViewMode('standard')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary rounded-md">{t('standard')}</button>
                        <button onClick={() => setViewMode('comparison')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary rounded-md">{t('comparison_pop')}</button>
                        <button onClick={() => setViewMode('percentage')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary rounded-md">{t('percentage_of_revenue')}</button>
                        <button onClick={() => setViewMode('budget')} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary rounded-md">{t('budget_vs_actual')}</button>
                    </FilterDropdown>
                </div>
                 <div className="flex items-center gap-2">
                    <button onClick={handleExportPdf} className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-accent transition-colors text-sm"><PdfIcon /> {t('export_pdf')}</button>
                    <button onClick={handleExportExcel} className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-accent transition-colors text-sm"><ExcelIcon /> {t('export_excel')}</button>
                </div>
            </div>

            {/* Dashboard Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-lg">{t('financial_kpis')}</h3>
                    {kpis.map(kpi => <KpiCard key={kpi.title} ratio={kpi} />)}
                </div>
                <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2"><AIIcon /> {t('ai_financial_summary')}</h3>
                        <button onClick={handleGenerateInsights} disabled={loadingInsights} className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-lg font-semibold disabled:opacity-50">{loadingInsights ? t('generating_insights') : t('generate')}</button>
                    </div>
                    <div className="min-h-[120px] bg-secondary p-4 rounded-lg text-sm prose dark:prose-invert max-w-none">
                        {loadingInsights ? <p className="animate-pulse">...</p> : (insights ? <div dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br />') }} /> : <p className="text-muted-foreground">{t('ai_summary_placeholder')}</p>)}
                    </div>
                </div>
            </div>
            
             <div className="my-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                <ToolButton onClick={() => setWhatIfModalOpen(true)} label={t('what_if_analysis')} />
                <ToolButton label={t('manage_chart_of_accounts')} />
                <ToolButton label={t('manage_budgets')} />
                <ToolButton label={t('manual_journal_entry')} />
                <ToolButton label={t('close_period')} isPrimary />
            </div>

            {/* P&L Table */}
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <PnlTableHeader viewMode={viewMode} />
                        <tbody>
                            {loading ? [...Array(8)].map((_, i) => <PnlRowSkeleton key={i} viewMode={viewMode}/>) :
                                pnlData.map(entry => (
                                    <PnlRow 
                                        key={entry.id} 
                                        entry={entry} 
                                        level={0} 
                                        isExpanded={expandedRows.has(entry.id)}
                                        onToggle={() => toggleRow(entry.id)}
                                        viewMode={viewMode}
                                        totalRevenue={totalRevenue}
                                    />
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ToolButton: React.FC<{label: string, isPrimary?: boolean, onClick?: () => void}> = ({ label, isPrimary, onClick }) => {
    const { addNotification } = useNotifications();
    const { t } = useLocalization();
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            addNotification(t('feature_in_development'), 'info');
        }
    };
    
    return (
        <button onClick={handleClick} className={`w-full p-3 text-center rounded-lg font-semibold text-sm transition-colors ${isPrimary ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-secondary hover:bg-accent'}`}>{label}</button>
    );
}

const PnlRow: React.FC<{entry: PnlEntry, level: number, isExpanded: boolean, onToggle: () => void, viewMode: ViewMode, totalRevenue: number}> = ({ entry, level, isExpanded, onToggle, viewMode, totalRevenue }) => {
    const hasSubRows = entry.subRows && entry.subRows.length > 0;
    const isTotal = entry.isTotal;

    const formatAmount = (amount?: number) => {
        if (amount === undefined || amount === null) return '-';
        const value = Math.abs(amount);
        const formatted = `EGP ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return amount < 0 ? `(${formatted})` : formatted;
    };
    
    const formatVariance = (current?: number, previous?: number) => {
        if (current === undefined || previous === undefined) return { value: '-', percent: '-', color: 'text-muted-foreground' };
        const diff = current - previous;
        const percent = previous !== 0 ? (diff / Math.abs(previous)) * 100 : 0;
        const color = diff >= 0 ? 'text-green-500' : 'text-red-500';
        return { value: formatAmount(diff), percent: `${percent.toFixed(1)}%`, color };
    }

    return (
        <>
            <tr className={`border-b border-border/50 hover:bg-secondary/50 ${isTotal ? 'border-t-2 border-border font-bold' : ''}`}>
                <td className="p-2">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 1.5}rem`}}>
                         {hasSubRows ? (
                             <button onClick={onToggle} className="p-1 rounded-full hover:bg-accent">
                                {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            </button>
                        ) : <div className="w-6"/>}
                        <span>{entry.title}</span>
                         <div title={entry.dataSource}><DataSourceIcon source={entry.dataSource} /></div>
                    </div>
                </td>
                
                {viewMode === 'standard' && <td className="p-2 text-right font-mono">{formatAmount(entry.amount)}</td>}
                
                {viewMode === 'percentage' && <td className="p-2 text-right font-mono">{totalRevenue > 0 ? `${((entry.amount / totalRevenue) * 100).toFixed(1)}%` : '0.0%'}</td>}

                {viewMode === 'comparison' && (
                    <>
                        <td className="p-2 text-right font-mono">{formatAmount(entry.amount)}</td>
                        <td className="p-2 text-right font-mono">{formatAmount(entry.previousAmount)}</td>
                        <td className="p-2 text-right font-mono">
                             <div className={`flex flex-col items-end ${formatVariance(entry.amount, entry.previousAmount).color}`}>
                                <span>{formatVariance(entry.amount, entry.previousAmount).value}</span>
                                <span className="text-xs">{formatVariance(entry.amount, entry.previousAmount).percent}</span>
                            </div>
                        </td>
                    </>
                )}

                {viewMode === 'budget' && (
                     <>
                        <td className="p-2 text-right font-mono">{formatAmount(entry.amount)}</td>
                        <td className="p-2 text-right font-mono">{formatAmount(entry.budgetAmount)}</td>
                         <td className="p-2 text-right font-mono">
                             <div className={`flex flex-col items-end ${formatVariance(entry.amount, entry.budgetAmount).color}`}>
                                <span>{formatVariance(entry.amount, entry.budgetAmount).value}</span>
                                 <span className="text-xs">{formatVariance(entry.amount, entry.budgetAmount).percent}</span>
                            </div>
                        </td>
                    </>
                )}
            </tr>
            {hasSubRows && isExpanded && entry.subRows?.map(subEntry => (
                 <PnlRow 
                    key={subEntry.id}
                    entry={subEntry}
                    level={level + 1}
                    isExpanded={isExpanded} 
                    onToggle={onToggle} // Note: This doesn't make sense for sub-rows if they can't also expand
                    viewMode={viewMode}
                    totalRevenue={totalRevenue}
                />
            ))}
        </>
    );
};

const WhatIfModal: React.FC<{ basePnl: PnlEntry[], onClose: () => void }> = ({ basePnl, onClose }) => {
    const { t } = useLocalization();
    const [scenario, setScenario] = useState('');
    const [simulatedPnl, setSimulatedPnl] = useState<PnlEntry[] | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        if (!scenario) return;
        setLoading(true);
        const result = await generateWhatIfPnl(basePnl, scenario);
        setSimulatedPnl(result);
        setLoading(false);
    };
    
     const formatAmount = (amount?: number) => {
        if (amount === undefined || amount === null) return '-';
        const value = Math.abs(amount);
        const formatted = `EGP ${value.toLocaleString()}`;
        return amount < 0 ? `(${formatted})` : formatted;
    };

    return (
        <Modal title={t('what_if_analysis')} onClose={onClose} size="lg">
            <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">{t('what_if_analysis_desc')}</p>
                 <div className="flex gap-2">
                    <input type="text" value={scenario} onChange={e => setScenario(e.target.value)} placeholder={t('what_if_prompt')} className="w-full bg-secondary p-2 rounded-lg border-border"/>
                    <button onClick={handleSimulate} disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold disabled:opacity-50">{loading ? '...' : t('simulate')}</button>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mt-4 overflow-y-auto max-h-[50vh]">
                     <div>
                        <h4 className="font-bold text-center mb-2">{t('base_case')}</h4>
                         <div className="p-2 bg-secondary rounded-lg space-y-1 text-sm">
                            {basePnl.map(e => <div key={e.id} className="flex justify-between"><span>{e.title}</span><span className={`font-mono ${e.isTotal ? 'font-bold' : ''}`}>{formatAmount(e.amount)}</span></div>)}
                        </div>
                     </div>
                     <div>
                        <h4 className="font-bold text-center mb-2">{t('simulated_case')}</h4>
                         <div className={`p-2 rounded-lg space-y-1 text-sm ${loading ? 'animate-pulse bg-secondary' : 'bg-secondary'}`}>
                             {simulatedPnl ? simulatedPnl.map(e => {
                                const baseAmount = basePnl.find(be => be.id === e.id)?.amount || 0;
                                const isChanged = e.amount !== baseAmount;
                                const color = e.amount > baseAmount ? 'text-green-500' : e.amount < baseAmount ? 'text-red-500' : '';
                                return <div key={e.id} className="flex justify-between"><span>{e.title}</span><span className={`font-mono ${e.isTotal ? 'font-bold' : ''} ${isChanged ? color : ''}`}>{formatAmount(e.amount)}</span></div>
                             }) : <div className="min-h-[200px]"/>}
                         </div>
                     </div>
                 </div>
            </div>
        </Modal>
    );
};


const FilterDropdown: React.FC<{icon: ReactNode, label: string, children: ReactNode}> = ({icon, label, children}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-accent transition-colors text-sm">
                {icon} {label} <ChevronDownIcon />
            </button>
            {isOpen && (
                <>
                <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-10"></div>
                <div className="absolute top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-20 p-2">
                    {children}
                </div>
                </>
            )}
        </div>
    );
};

const PnlRowSkeleton: React.FC<{viewMode: ViewMode}> = ({viewMode}) => {
    const cols = viewMode === 'standard' || viewMode === 'percentage' ? 2 : 4;
    return (
        <tr className="border-b border-border/50">
            {[...Array(cols)].map((_, i) => (
                <td key={i} className="p-3"><div className="h-5 bg-secondary rounded w-full animate-pulse"></div></td>
            ))}
        </tr>
    );
};

const PnlTableHeader: React.FC<{viewMode: ViewMode}> = ({viewMode}) => {
    const { t } = useLocalization();
    const baseClasses = "p-2 text-left rtl:text-right font-semibold text-muted-foreground uppercase text-xs";
    const headers: Record<ViewMode, string[]> = {
        standard: [t('account'), t('amount')],
        percentage: [t('account'), '% of Revenue'],
        comparison: [t('account'), t('current_period'), t('previous_period'), t('variance')],
        budget: [t('account'), t('actual'), t('budget'), t('variance')]
    };
    
    return (
        <thead>
            <tr className="border-b-2 border-border">
                {headers[viewMode].map((header, index) => (
                    <th key={header} className={`${baseClasses} ${index > 0 ? 'text-right' : ''}`}>{header}</th>
                ))}
            </tr>
        </thead>
    )
};
