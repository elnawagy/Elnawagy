import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import type { LeaveRequest } from '../types';
import { LogoutIcon, UserCircleIcon, CalendarIcon, LeaveIcon } from './icons';

export const EmployeePortal: React.FC = () => {
    const { user, logout } = useAuth();
    const { t } = useLocalization();
    const { attendanceRecords, leaveRequests: allLeaveRequests } = useSystem();
    const [activeTab, setActiveTab] = useState('profile');
    
    const myAttendance = attendanceRecords.filter(r => r.employeeId === user?.employeeId);
    const myLeaveRequests = allLeaveRequests.filter(r => r.employeeId === user?.employeeId);

    return (
        <div className="min-h-screen bg-secondary">
            <header className="bg-card border-b border-border shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary">{t('employee_portal')}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{t('greeting')} {user?.name.split(' ')[0]}</span>
                        <button onClick={logout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-semibold"><LogoutIcon />{t('logout')}</button>
                    </div>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <aside className="md:col-span-1">
                        <ul className="space-y-1 bg-card p-2 rounded-lg border border-border">
                             <TabButton id="profile" label={t('my_profile')} icon={<UserCircleIcon />} activeTab={activeTab} setActiveTab={setActiveTab} />
                             <TabButton id="attendance" label={t('my_attendance')} icon={<CalendarIcon />} activeTab={activeTab} setActiveTab={setActiveTab} />
                             <TabButton id="leave" label={t('my_leave_requests')} icon={<LeaveIcon />} activeTab={activeTab} setActiveTab={setActiveTab} />
                        </ul>
                    </aside>
                    <div className="md:col-span-3 bg-card p-6 rounded-lg border border-border">
                        {activeTab === 'profile' && <ProfileTab />}
                        {activeTab === 'attendance' && <AttendanceTab records={myAttendance} />}
                        {activeTab === 'leave' && <LeaveTab requests={myLeaveRequests} />}
                    </div>
                </div>
            </main>
        </div>
    );
};

const TabButton: React.FC<{id:string, label:string, icon: React.ReactNode, activeTab:string, setActiveTab: (id:string) => void}> = ({id, label, icon, activeTab, setActiveTab}) => (
     <li>
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 p-3 rounded-md text-sm font-semibold text-left rtl:text-right ${activeTab === id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
        >
            {icon} {label}
        </button>
    </li>
);

const ProfileTab = () => {
    const { t } = useLocalization();
    return <div><h2 className="text-2xl font-bold mb-4">{t('my_profile')}</h2><p>{t('personal_information')} will be displayed here.</p></div>;
};

const AttendanceTab: React.FC<{records: any[]}> = ({ records }) => {
    const { t } = useLocalization();
    return <div><h2 className="text-2xl font-bold mb-4">{t('my_attendance')}</h2><p>{records.length} records found.</p></div>;
};

const LeaveTab: React.FC<{requests: LeaveRequest[]}> = ({ requests }) => {
    const { t } = useLocalization();
    const [showForm, setShowForm] = useState(false);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold">{t('my_leave_requests')}</h2>
                 <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">{showForm ? t('cancel') : t('request_leave')}</button>
            </div>
            {showForm && <LeaveRequestForm close={() => setShowForm(false)} />}
             <div className="mt-4 space-y-3">
                 {requests.length === 0 ? <p className="text-muted-foreground">{t('no_leave_requests')}</p> : requests.map(req => (
                     <div key={req.id} className="p-3 bg-secondary rounded-lg flex justify-between items-center text-sm">
                         <div>
                            <p className="font-semibold">{t(req.leaveType.toLowerCase() as any)}: {req.startDate} - {req.endDate}</p>
                            <p className="text-xs text-muted-foreground">{t('request_date')}: {req.requestDate}</p>
                         </div>
                         <span className={`px-2 py-1 text-xs rounded-full font-medium ${req.status === 'Approved' ? 'bg-green-100 text-green-700' : req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{t(req.status.toLowerCase() as any)}</span>
                     </div>
                 ))}
             </div>
        </div>
    );
};

const LeaveRequestForm = ({close}: {close: () => void}) => {
    const { t } = useLocalization();
    return (
        <div className="p-4 border border-border rounded-lg mb-4 bg-secondary/50">
            <form className="space-y-3">
                 <div>
                    <label className="text-sm font-medium">{t('leave_type')}</label>
                    <select className="mt-1 w-full p-2 rounded-md bg-card border-border"><option>{t('annual')}</option><option>{t('sick')}</option><option>{t('unpaid')}</option></select>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium">{t('start_date')}</label><input type="date" className="mt-1 w-full p-2 rounded-md bg-card border-border"/></div>
                    <div><label className="text-sm font-medium">{t('end_date')}</label><input type="date" className="mt-1 w-full p-2 rounded-md bg-card border-border"/></div>
                 </div>
                 <div>
                    <label className="text-sm font-medium">{t('reason')}</label>
                    <textarea rows={3} placeholder={t('reason_placeholder')} className="mt-1 w-full p-2 rounded-md bg-card border-border"></textarea>
                 </div>
                 <div className="flex justify-end"><button type="submit" onClick={close} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">{t('submit_request')}</button></div>
            </form>
        </div>
    )
}
