import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import { generateAttendanceSummary } from '../services/geminiService';
import { exportToPdf, exportToExcel, exportToCsv } from '../services/exportService';
import type { AttendanceRecord, Employee } from '../types';
import { SearchIcon, FilterIcon, DownloadIcon, PdfIcon, CsvIcon, ExcelIcon, PlusIcon, AIIcon, BarChartIcon, SyncIcon, TrashIcon } from './icons';

const AttendanceView: React.FC = () => {
    const { attendanceRecords, employees, loading, branches, currentBranchId } = useSystem();
    const [activeTab, setActiveTab] = useState('dashboard');
    const { t } = useLocalization();

    const currentBranch = useMemo(() => branches.find(b => b.id === currentBranchId), [branches, currentBranchId]);

    const branchRecords = useMemo(() => {
        if (!currentBranch) return attendanceRecords;
        return attendanceRecords.filter(r => r.branch === currentBranch.name);
    }, [attendanceRecords, currentBranch]);

    const branchEmployees = useMemo(() => {
        if (!currentBranch) return employees;
        return employees.filter(e => e.branch === currentBranch.name && e.status === 'Active');
    }, [employees, currentBranch]);

    const handleRecordUpdate = () => {
        // In a real app, this would trigger a re-fetch of data.
        // Here we can't do much as data is generated once in context.
        // A full app would likely have a function in the context to refetch data.
        console.log("Record update triggered. In a real app, data would be refetched.");
    }

    const tabs = [
        { id: 'dashboard', label: t('dashboard_tab') },
        { id: 'records', label: t('records') },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">{t('attendance_management')}</h1>
                    <p className="mt-2 text-muted-foreground">{t('attendance_subtitle')}</p>
                </div>
            </div>

            <div className="mt-4 border-b border-border">
                <nav className="-mb-px flex space-x-4 rtl:space-x-reverse overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-sm transition-colors ${
                                activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-6">
                {activeTab === 'dashboard' && <AttendanceDashboard records={branchRecords} loading={loading} />}
                {activeTab === 'records' && <AttendanceRecords records={branchRecords} employees={branchEmployees} loading={loading} onRecordUpdate={handleRecordUpdate} />}
            </div>
        </div>
    );
};

const AttendanceDashboard: React.FC<{ records: AttendanceRecord[], loading: boolean }> = ({ records, loading }) => {
    const { t } = useLocalization();
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiAnswer, setAiAnswer] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);

    const stats = useMemo(() => {
        const total = records.length;
        if (total === 0) return { rate: 0, late: 0, absent: 0, onLeave: 0 };
        
        const presentOrLate = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
        const late = records.filter(r => r.status === 'Late').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const onLeave = records.filter(r => r.status === 'On Leave').length;
        const rate = total > onLeave ? (presentOrLate / (total - onLeave)) * 100 : 100;

        return { rate, late, absent, onLeave };
    }, [records]);

    const handleAskAi = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiQuestion.trim()) return;
        setLoadingAi(true);
        setAiAnswer('');
        const summary = await generateAttendanceSummary(aiQuestion, records);
        setAiAnswer(summary);
        setLoadingAi(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title={t('attendance_rate')} value={loading ? '...' : `${stats.rate.toFixed(1)}%`} />
                <KPICard title={t('late_today')} value={loading ? '...' : stats.late.toString()} />
                <KPICard title={t('absent_today')} value={loading ? '...' : stats.absent.toString()} />
                <KPICard title={t('on_leave')} value={loading ? '...' : stats.onLeave.toString()} />
            </div>

            <DashboardCard title={t('ai_attendance_insights')} icon={<AIIcon />}>
                <form onSubmit={handleAskAi}>
                    <div className="relative">
                        <input
                            type="text"
                            value={aiQuestion}
                            onChange={(e) => setAiQuestion(e.target.value)}
                            placeholder={t('ai_attendance_prompt')}
                            className="w-full bg-secondary border-border rounded-lg p-3 pe-12 focus:ring-primary focus:border-primary transition-shadow"
                        />
                         <button type="submit" className="absolute top-1/2 -translate-y-1/2 rtl:left-3 ltr:right-3 text-primary font-semibold" disabled={loadingAi}>{loadingAi ? '...' : 'Ask'}</button>
                    </div>
                </form>
                {aiAnswer && <div className="mt-4 p-4 bg-secondary rounded-lg text-sm prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiAnswer.replace(/\n/g, '<br />') }}></div>}
            </DashboardCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardCard title={t('attendance_by_branch')} icon={<BarChartIcon />}>
                    <div className="h-60 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground">{t('bar_chart')} Placeholder</div>
                </DashboardCard>
                <DashboardCard title={t('integrations_hub')} icon={<SyncIcon />}>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Keep your systems in sync.</p>
                        <button onClick={() => alert(t('payroll_sync_success'))} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg font-semibold hover:bg-accent transition-colors">
                            <SyncIcon /> {t('sync_with_payroll')}
                        </button>
                         <button onClick={() => alert(t('leave_sync_success'))} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg font-semibold hover:bg-accent transition-colors">
                            <SyncIcon /> {t('sync_with_leave')}
                        </button>
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

const KPICard: React.FC<{ title: string, value: string }> = ({ title, value }) => (
    <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="mt-1 text-4xl font-bold text-primary">{value}</p>
    </div>
);

const DashboardCard: React.FC<{ title: string, icon: ReactNode, children: ReactNode, className?: string }> = ({ title, icon, children, className }) => (
    <div className={`p-4 sm:p-6 rounded-xl border border-border bg-card shadow-sm ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            <div className="text-primary">{icon}</div>
            <h2 className="font-bold text-lg text-foreground">{title}</h2>
        </div>
        {children}
    </div>
);

const AttendanceRecords: React.FC<{ records: AttendanceRecord[], employees: Employee[], loading: boolean, onRecordUpdate: () => void }> = ({ records, employees, loading, onRecordUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const { t } = useLocalization();

    const branches = useMemo(() => [...new Set(records.map(r => r.branch))], [records]);
    const statuses: AttendanceRecord['status'][] = ['Present', 'Late', 'Absent', 'On Leave'];

    const filteredRecords = useMemo(() => {
        return records.filter(record =>
            (record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (branchFilter === 'all' || record.branch === branchFilter) &&
            (statusFilter === 'all' || record.status === statusFilter)
        );
    }, [records, searchTerm, branchFilter, statusFilter]);
    
    const headers = [t('employee_name'), t('branch'), t('date'), t('check_in'), t('check_out'), t('duration'), t('status'), t('notes')];
    const dataForExport = filteredRecords.map(r => ({
        [t('employee_name')]: r.employeeName, [t('branch')]: r.branch, [t('date')]: r.date,
        [t('check_in')]: r.checkIn, [t('check_out')]: r.checkOut, [t('duration')]: r.duration,
        [t('status')]: r.status, [t('notes')]: r.notes || ''
    }));

    const getStatusColor = (status: AttendanceRecord['status']) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Absent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'On Leave': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    
    const handleAdd = () => {
        setSelectedRecord(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedRecord(null);
    };
    
    const handleSave = () => {
        // In a real app, this would make an API call.
        // Here we just refresh the mock data.
        onRecordUpdate(); 
        handleModalClose();
    }

    return (
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
             {isModalOpen && <RecordModal record={selectedRecord} employees={employees} onClose={handleModalClose} onSave={handleSave} />}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-grow">
                    <SearchIcon className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t('search_attendance')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-secondary border-border rounded-md shadow-sm p-2 ltr:pl-10 rtl:pr-10 focus:ring-primary focus:border-primary"
                    />
                </div>
                 <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="bg-secondary border-border rounded-md shadow-sm p-2 w-full md:w-auto">
                    <option value="all">{t('all_branches')}</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-secondary border-border rounded-md shadow-sm p-2 w-full md:w-auto">
                    <option value="all">{t('all_statuses')}</option>
                    {statuses.map(s => <option key={s} value={s}>{t(s.toLowerCase() as any)}</option>)}
                </select>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative group flex-grow">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg font-semibold hover:bg-accent transition-colors">
                            <DownloadIcon />
                        </button>
                        <div className="absolute top-full ltr:right-0 rtl:left-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                            <button onClick={() => exportToPdf(dataForExport, headers, t('attendance_management'), 'attendance_report')} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><PdfIcon/> {t('export_as_pdf')}</button>
                            <button onClick={() => exportToCsv(dataForExport, 'attendance_report')} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><CsvIcon/> {t('export_as_csv')}</button>
                            <button onClick={() => exportToExcel(dataForExport, 'attendance_report')} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-secondary text-sm"><ExcelIcon/> {t('export_as_excel')}</button>
                        </div>
                    </div>
                     <button onClick={handleAdd} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                        <PlusIcon /> <span className="hidden md:inline">{t('add_record')}</span>
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-foreground">
                    <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('employee_name')}</th>
                            <th scope="col" className="px-6 py-3">{t('branch')}</th>
                            <th scope="col" className="px-6 py-3">{t('check_in')}</th>
                            <th scope="col" className="px-6 py-3">{t('check_out')}</th>
                            <th scope="col" className="px-6 py-3">{t('status')}</th>
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
                            filteredRecords.map(record => (
                                <tr key={record.id} className="bg-card border-b border-border hover:bg-secondary transition-colors">
                                    <td className="px-6 py-4 font-medium whitespace-nowrap">{record.employeeName}</td>
                                    <td className="px-6 py-4">{record.branch}</td>
                                    <td className="px-6 py-4 text-green-600 font-semibold">{record.checkIn || '-'}</td>
                                    <td className="px-6 py-4 text-red-600 font-semibold">{record.checkOut || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                                            {t(record.status.toLowerCase() as any)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleEdit(record)} className="px-3 py-1 bg-secondary text-sm font-semibold rounded-md hover:bg-accent transition-colors">
                                            {t('edit_short')}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
             {filteredRecords.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                    No attendance records found.
                </div>
            )}
        </div>
    );
};

const RecordModal: React.FC<{record: AttendanceRecord | null, employees: Employee[], onClose: () => void, onSave: () => void}> = ({ record, employees, onClose, onSave }) => {
    const { t } = useLocalization();
    const isEdit = !!record;
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className={`bg-card rounded-2xl shadow-2xl w-full max-w-lg`} onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold">{isEdit ? t('edit_record') : t('add_record')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('employee')}</label>
                        <select defaultValue={record?.employeeName} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary" disabled={isEdit}>
                            {!isEdit && <option>Select employee</option>}
                            {employees.map(e => <option key={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-sm font-medium text-muted-foreground">{t('check_in')}</label>
                            <input type="time" defaultValue={record?.checkIn || ''} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm p-2"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">{t('check_out')}</label>
                            <input type="time" defaultValue={record?.checkOut || ''} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm p-2"/>
                        </div>
                     </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('status')}</label>
                        <select defaultValue={record?.status} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary">
                             {['Present', 'Late', 'Absent', 'On Leave'].map(s => <option key={s} value={s}>{t(s.toLowerCase() as any)}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('notes')}</label>
                        <textarea defaultValue={record?.notes} rows={3} placeholder={t('notes_placeholder')} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm p-2"></textarea>
                    </div>
                </div>
                 <div className="p-4 bg-secondary/50 border-t border-border flex justify-between items-center">
                    <div>
                    {isEdit && <button className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-semibold"><TrashIcon/>{t('delete_record')}</button>}
                    </div>
                    <div className="flex gap-3">
                         <button onClick={onClose} className="px-4 py-2 bg-card border border-border rounded-lg font-semibold hover:bg-accent transition-colors">{t('cancel')}</button>
                         <button onClick={onSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity">{t('save_record')}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { AttendanceView };