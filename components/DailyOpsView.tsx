
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

const ChecklistItem: React.FC<{ label: string, id: string }> = ({ label, id }) => (
    <div className="flex items-center">
        <input id={id} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
        <label htmlFor={id} className="ms-2 block text-sm text-foreground">{label}</label>
    </div>
);

export const DailyOpsView: React.FC = () => {
    const { t } = useLocalization();

    const openingTasks = [
        "Check cash drawer float",
        "Turn on all equipment (coffee, ovens)",
        "Wipe down all tables and chairs",
        "Check restroom cleanliness",
        "Review daily specials with staff"
    ];

    const closingTasks = [
        "Reconcile cash drawer",
        "Clean all kitchen stations",
        "Take out all trash and recycling",
        "Lock all doors and windows",
        "Set alarm system"
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground">{t('daily_ops_management')}</h1>
                <p className="mt-2 text-muted-foreground">{t('daily_ops_subtitle')}</p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-foreground">{t('opening_checklist')}</h2>
                    <div className="mt-4 space-y-3">
                        {openingTasks.map((task, i) => <ChecklistItem key={i} id={`open-${i}`} label={task} />)}
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-foreground">{t('closing_checklist')}</h2>
                    <div className="mt-4 space-y-3">
                         {closingTasks.map((task, i) => <ChecklistItem key={i} id={`close-${i}`} label={task} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};
