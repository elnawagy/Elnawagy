

import React, { useState, useMemo, ReactNode, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { generateReportSummary } from '../services/geminiService';
import { exportToPdf, exportToExcel, exportToCsv } from '../services/exportService';
import type { Report as ReportType } from '../types';
import {
    SearchIcon, CreateIcon, StarIcon, BarChartIcon, LineChartIcon, PieChartIcon,
    SalesIcon, InventoryIcon, FinancialSettingsIcon, HRIcon, CustomersIcon,
    DownloadIcon, ScheduleIcon, PdfIcon, CsvIcon, PlusIcon, TrashIcon, ReportsIcon,
    AIIcon, FxIcon, ShareIcon, ExcelIcon, ConditionalFormattingIcon
} from './icons';

type ReportCategory = 'Sales' | 'Inventory' | 'Financial' | 'Employee' | 'Customer';
interface DetailedReport extends ReportType {
    category: ReportCategory;
    isFavorite: boolean;
}

const allReportsData: DetailedReport[] = [
    { id: 'REP-01', name: 'sales_summary', description: 'sales_summary_desc', lastGenerated: '2023-10-28 09:00 AM', category: 'Sales', isFavorite: true },
    { id: 'REP-02', name: 'product_performance', description: 'product_performance_desc', lastGenerated: '2023-10-28 08:30 AM', category: 'Sales', isFavorite: false },
    { id: 'REP-03', name: 'payment_methods_report', description: 'payment_methods_report_desc', lastGenerated: '2023-10-27 11:00 AM', category: 'Sales', isFavorite: false },
    { id: 'REP-04', name: 'sales_by_category', description: 'sales_by_category_desc', lastGenerated: '2023-10-28 11:30 AM', category: 'Sales', isFavorite: true },
    { id: 'REP-12', name: 'hourly_sales', description: 'hourly_sales_desc', lastGenerated: '2023-10-28 12:00 PM', category: 'Sales', isFavorite: false },
    { id: 'REP-10', name: 'discount_usage', description: 'discount_usage_desc', lastGenerated: '2023-10-27 15:00 PM', category: 'Sales', isFavorite: false },
    { id: 'REP-05', name: 'stock_on_hand', description: 'stock_on_hand_desc', lastGenerated: '2023-10-28 09:15 AM', category: 'Inventory', isFavorite: true },
    { id: 'REP-06', name: 'low_stock_summary', description: 'low_stock_summary_desc', lastGenerated: '2023-10-28 09:10 AM', category: 'Inventory', isFavorite: false },
    { id: 'REP-11', name: 'inventory_wastage', description: 'inventory_wastage_desc', lastGenerated: '2023-10-28 09:30 AM', category: 'Inventory', isFavorite: false },
    { id: 'REP-07', name: 'tax_summary', description: 'tax_summary_desc', lastGenerated: '2023-10-26 17:00 PM', category: 'Financial', isFavorite: false },
    { id: 'REP-08', name: 'employee_performance', description: 'employee_performance_desc', lastGenerated: '2023-10-25 10:00 AM', category: 'Employee', isFavorite: false },
    { id: 'REP-09', name: 'top_customers', description: 'top_customers_desc', lastGenerated: '2023-10-28 10:30 AM', category: 'Customer', isFavorite: true },
];

const CategoryIcon: React.FC<{ category: ReportCategory }> = ({ category }) => {
    switch (category) {
        case 'Sales': return <SalesIcon />;
        case 'Inventory': return <InventoryIcon />;
        case 'Financial': return <FinancialSettingsIcon />;
        case 'Employee': return <HRIcon />;
        case 'Customer': return <CustomersIcon />;
        default: return <ReportsIcon />;
    }
};

const ReportCard: React.FC<{ report: DetailedReport, onRun: (report: DetailedReport) => void, onToggleFavorite: (id: string) => void }> = ({ report, onRun, onToggleFavorite }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-card border border-border rounded-xl shadow-sm p-4 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1">
            <div>
                <div className="flex justify-between items-start">
                    <div className="p-2 bg-secondary rounded-lg mb-3">
                        <CategoryIcon category={report.category} />
                    </div>
                    <button onClick={() => onToggleFavorite(report.id)} className="text-muted-foreground hover:text-yellow-400 p-1" aria-label="Toggle Favorite">
                        <StarIcon isFavorite={report.isFavorite} />
                    </button>
                </div>
                <h3 className="font-bold text-md text-foreground">{t(report.name as any)}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t(report.description as any)}</p>
            </div>
            <button onClick={() => onRun(report)} className="w-full mt-4 py-2 text-sm bg-secondary rounded-lg font-semibold hover:bg-accent transition-colors">
                {t('run_report')}
            </button>
        </div>
    );
};

const Modal: React.FC<{ children: ReactNode, onClose: () => void, title: string, size?: 'md' | 'lg' | 'xl' }> = ({ children, onClose, title, size = 'lg' }) => {
    const sizeClasses = {
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-7xl', // Increased size for BI-style builder
    }
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className={`bg-card rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
                <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">&times;</button>
                </div>
                {children}
            </div>
        </Modal>
    );
}

const ReportBuilderModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { t } = useLocalization();
    if (!isOpen) return null;

    const availableFields = ['ID', 'Date', 'Customer', 'Branch', 'Total', 'Status', 'Category', 'Item Name', 'Cost', 'Quantity'];

    return (
        <Modal onClose={onClose} title={t('report_builder')} size="xl">
            <div className="flex-grow min-h-0 md:flex">
                {/* Left Panel: Available Fields */}
                <div className="w-full md:w-1/4 p-4 border-b md:border-b-0 md:border-r border-border overflow-y-auto">
                    <h3 className="font-semibold mb-2">{t('available_fields')}</h3>
                    <div className="space-y-2">
                        {availableFields.map(field => (
                             <div key={field} className="p-2 bg-secondary rounded-md text-sm cursor-grab">{field}</div>
                        ))}
                    </div>
                </div>

                {/* Center Panel: Configuration */}
                <div className="w-full md:w-2/4 p-4 overflow-y-auto">
                    <input type="text" placeholder={t('report_name')} className="block w-full bg-secondary border-border rounded-md p-2 mb-4" />
                    <div className="space-y-4">
                         <div>
                            <h4 className="font-semibold text-sm mb-1">{t('columns')}</h4>
                            <div className="p-4 bg-secondary min-h-[80px] rounded-md text-center text-muted-foreground text-sm flex items-center justify-center">{t('drag_and_drop_fields')}</div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">{t('advanced_filters')}</h4>
                            <div className="p-3 bg-secondary rounded-md space-y-2 border border-dashed border-border">
                                <div className="flex items-center gap-2 text-sm">
                                   <select className="bg-card p-1 rounded"><option>Branch</option></select>
                                   <select className="bg-card p-1 rounded"><option>=</option></select>
                                   <input type="text" defaultValue="Maadi Branch" className="bg-card p-1 rounded w-full"/>
                                   <button className="p-1 hover:bg-card rounded-full"><TrashIcon/></button>
                                </div>
                                <div className="flex items-center gap-2"><button className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-500">{t('and_condition')}</button></div>
                                 <div className="flex items-center gap-2 text-sm">
                                   <select className="bg-card p-1 rounded"><option>Total</option></select>
                                   <select className="bg-card p-1 rounded"><option>{t('greater_than')}</option></select>
                                   <input type="number" defaultValue="500" className="bg-card p-1 rounded w-full"/>
                                   <button className="p-1 hover:bg-card rounded-full"><TrashIcon/></button>
                                </div>
                                <div className="pt-2 flex gap-2">
                                    <button className="flex items-center gap-1 text-sm text-primary font-semibold"><PlusIcon/>{t('add_filter')}</button>
                                    <button className="flex items-center gap-1 text-sm text-primary font-semibold"><PlusIcon/>{t('add_filter_group')}</button>
                                </div>
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2"><FxIcon /> {t('calculated_fields')}</h4>
                             <div className="p-3 bg-secondary rounded-md space-y-2">
                                 <button className="flex items-center gap-1 text-sm text-primary font-semibold"><PlusIcon/>{t('add_calculated_field')}</button>
                             </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2"><ConditionalFormattingIcon /> {t('conditional_formatting')}</h4>
                             <div className="p-3 bg-secondary rounded-md space-y-2">
                                 <button className="flex items-center gap-1 text-sm text-primary font-semibold"><PlusIcon/>{t('add_rule')}</button>
                             </div>
                        </div>
                    </div>
                </div>

                 {/* Right Panel: Preview & Visualization */}
                <div className="w-full md:w-1/4 p-4 bg-secondary/50 overflow-y-auto">
                     <h3 className="font-semibold mb-2">{t('report_preview')}</h3>
                     <div className="bg-card rounded p-2 min-h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                        Preview Area
                     </div>
                     <h3 className="font-semibold mt-4 mb-2">{t('visualization')}</h3>
                     <div className="grid grid-cols-2 gap-2">
                        {[{label: t('table'), Icon: ReportsIcon}, {label: t('bar_chart'), Icon: BarChartIcon}, {label: t('line_chart'), Icon: LineChartIcon}, {label: t('pie_chart'), Icon: PieChartIcon}].map(({label, Icon}) => (
                            <button key={label} className="p-3 flex flex-col items-center gap-2 bg-card rounded-md border-2 border-transparent hover:border-primary data-[selected=true]:border-primary data-[selected=true]:bg-primary/10" data-selected={label === t('table')}>
                                <Icon /> <span className="text-xs font-semibold">{label}</span>
                            </button>
                        ))}
                     </div>
                </div>
            </div>
            <div className="p-4 bg-secondary/50 border-t border-border flex justify-end gap-3 flex-shrink-0">
                <button onClick={onClose} className="px-6 py-2 bg-card border border-border rounded-lg font-semibold hover:bg-accent transition-colors">{t('cancel')}</button>
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity">{t('run_and_generate')}</button>
            </div>
        </Modal>
    );
};

const ReportViewerModal: React.FC<{ isOpen: boolean, onClose: () => void, report: DetailedReport | null }> = ({ isOpen, onClose, report }) => {
    const { t } = useLocalization();
    const [summary, setSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);

    // Mock data for the report table
    const mockReportData = [
        { Customer: 'Ahmed Ali', Branch: 'Maadi Branch', Total: 540, Date: '2023-10-28' },
        { Customer: 'Sara Hassan', Branch: 'Zamalek Branch', Total: 1200, Date: '2023-10-28' },
        { Customer: 'Mona Fouad', Branch: 'Maadi Branch', Total: 320, Date: '2023-10-28' },
        { Customer: 'Khaled Said', Branch: 'Maadi Branch', Total: 850, Date: '2023-10-27' },
        { Customer: 'Hoda Ezzat', Branch: 'Zamalek Branch', Total: 710, Date: '2023-10-27' },
    ];
    const reportHeaders = ['Customer', 'Branch', 'Total', 'Date'];


    useEffect(() => {
        if (isOpen && report) {
            setLoadingSummary(true);
            generateReportSummary(t(report.name as any), mockReportData).then(res => {
                setSummary(res);
                setLoadingSummary(false);
            });
        }
    }, [isOpen, report, t]);

    if (!isOpen || !report) return null;

    return (
        <Modal onClose={onClose} title={t(report.name as any)} size="xl">
             <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
                 <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-6">
                    <p className="text-muted-foreground text-sm max-w-2xl">{t(report.description as any)}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                         <button className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-accent transition-colors text-sm"><ShareIcon /> {t('share_report')}</button>
                         <button className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-accent transition-colors text-sm"><ScheduleIcon /> {t('schedule_report')}</button>
                         <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-accent transition-colors text-sm"><DownloadIcon /> {t('export')}</button>
                            <div className="absolute top-full ltr:right-0 rtl:left-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                                <button onClick={() => exportToPdf(mockReportData, reportHeaders, t(report.name as any), report.name)} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><PdfIcon/> {t('export_as_pdf')}</button>
                                <button onClick={() => exportToCsv(mockReportData, report.name)} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><CsvIcon/> {t('export_as_csv')}</button>
                                <button onClick={() => exportToExcel(mockReportData, report.name)} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><ExcelIcon/> {t('export_as_excel')}</button>
                            </div>
                         </div>
                    </div>
                </div>

                <div className="border border-border rounded-xl mb-6">
                    <div className="p-4 bg-secondary/50 rounded-t-xl border-b border-border">
                        <h3 className="font-semibold flex items-center gap-2"><AIIcon /> {t('ai_insights')}</h3>
                    </div>
                    <div className="p-4 min-h-[80px]">
                        {loadingSummary ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-4 bg-secondary rounded w-5/6"></div>
                                <div className="h-4 bg-secondary rounded w-3/4"></div>
                                <div className="h-4 bg-secondary rounded w-4/6"></div>
                            </div>
                        ) : (
                            <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-foreground">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                            <tr>
                                {reportHeaders.map(h => <th key={h} scope="col" className="px-6 py-3">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {mockReportData.map((row, i) => (
                                <tr key={i} className="bg-card hover:bg-secondary/50 transition-colors">
                                    <td className="px-6 py-4 font-medium whitespace-nowrap">{row.Customer}</td>
                                    <td className="px-6 py-4">{row.Branch}</td>
                                    <td className="px-6 py-4">EGP {row.Total.toLocaleString()}</td>
                                    <td className="px-6 py-4">{row.Date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
}

export const ReportsView: React.FC = () => {
    const [reports, setReports] = useState<DetailedReport[]>(allReportsData);
    const [searchTerm, setSearchTerm] = useState('');
    const [isBuilderOpen, setBuilderOpen] = useState(false);
    const [isViewerOpen, setViewerOpen] = useState(false);
    const [activeReport, setActiveReport] = useState<DetailedReport | null>(null);
    const { t } = useLocalization();

    const filteredReports = useMemo(() => {
        return reports.filter(report =>
            t(report.name as any).toLowerCase().includes(searchTerm.toLowerCase()) ||
            t(report.description as any).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reports, searchTerm, t]);

    const favoriteReports = useMemo(() => reports.filter(r => r.isFavorite), [reports]);
    const customReports = useMemo(() => reports.filter(r => r.id.startsWith('CUST')), [reports]); // Mock custom reports

    const categorizedReports = useMemo(() => {
        return filteredReports
            .filter(r => !r.isFavorite && !r.id.startsWith('CUST'))
            .reduce((acc: Record<ReportCategory, DetailedReport[]>, report) => {
                const category = report.category;
                (acc[category] = acc[category] || []).push(report);
                return acc;
            }, {} as Record<ReportCategory, DetailedReport[]>);
    }, [filteredReports]);

    const toggleFavorite = (id: string) => {
        setReports(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
    };

    const handleRunReport = (report: DetailedReport) => {
        setActiveReport(report);
        setViewerOpen(true);
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <ReportBuilderModal isOpen={isBuilderOpen} onClose={() => setBuilderOpen(false)} />
            <ReportViewerModal isOpen={isViewerOpen} onClose={() => setViewerOpen(false)} report={activeReport} />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">{t('reports_hub')}</h1>
                    <p className="mt-2 text-muted-foreground">{t('reports_hub_subtitle')}</p>
                </div>
                <button
                    onClick={() => setBuilderOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto"
                >
                    <CreateIcon />
                    {t('create_custom_report')}
                </button>
            </div>
            
             <div className="mt-6 relative">
                 <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 flex items-center pl-3 pointer-events-none">
                     <AIIcon />
                 </div>
                 <input
                     type="text"
                     placeholder={t('ask_ai_prompt')}
                     className="w-full bg-card border-border rounded-lg shadow-sm p-3 ltr:pl-10 rtl:pr-10 focus:ring-primary focus:border-primary transition-shadow hover:shadow-md"
                 />
             </div>


            {/* Favorite Reports Section */}
            {favoriteReports.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold flex items-center gap-2"><StarIcon isFavorite /> {t('favorite_reports')}</h2>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favoriteReports.map(report => (
                            <ReportCard key={report.id} report={report} onRun={handleRunReport} onToggleFavorite={toggleFavorite} />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Custom Reports Section */}
            {customReports.length > 0 && (
                 <div className="mt-8">
                    <h2 className="text-xl font-bold">{t('my_custom_reports')}</h2>
                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {/* Placeholder for custom reports */}
                     </div>
                 </div>
            )}

            {/* Pre-built Reports Section */}
            <div className="mt-8">
                 <h2 className="text-xl font-bold">{t('pre_built_reports')}</h2>
                 <div className="mt-4 space-y-8">
                     {Object.entries(categorizedReports).map(([category, reportsInCategory]: [string, DetailedReport[]]) => (
                         <div key={category}>
                             <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><CategoryIcon category={category as ReportCategory} /> {t((category.toLowerCase() + '_reports') as any)}</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                 {reportsInCategory.map(report => (
                                     <ReportCard key={report.id} report={report} onRun={handleRunReport} onToggleFavorite={toggleFavorite} />
                                 ))}
                             </div>
                         </div>
                     ))}
                 </div>
            </div>

        </div>
    );
};
