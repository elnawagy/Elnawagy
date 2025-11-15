
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { generateBranchesData } from '../services/geminiService';
import type { Branch } from '../types';
import { PlusIcon } from './icons';

const BranchCard: React.FC<{ branch: Branch }> = ({ branch }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-card border border-border rounded-xl shadow-sm p-5 transition-all hover:shadow-md hover:-translate-y-1">
            <h3 className="font-bold text-xl text-primary truncate">{branch.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('manager')}: {branch.manager}</p>
            <div className="mt-6 border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('employees')}:</span>
                    <span className="font-semibold">{branch.employeeCount}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('daily_sales')}:</span>
                    <span className="font-bold text-lg">EGP {branch.dailySales.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export const BranchesView: React.FC = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLocalization();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await generateBranchesData();
            setBranches(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">{t('branches_management')}</h1>
                    <p className="mt-2 text-muted-foreground">{t('branches_subtitle')}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
                    <PlusIcon />
                    {t('add_branch')}
                </button>
            </div>
             <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                         <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                            <div className="h-7 bg-secondary rounded w-3/4"></div>
                            <div className="h-4 bg-secondary rounded w-1/2 mt-2"></div>
                            <div className="mt-6 border-t border-border pt-4 space-y-3">
                                <div className="h-4 bg-secondary rounded w-full"></div>
                                <div className="h-6 bg-secondary rounded w-2/3"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    branches.map(branch => <BranchCard key={branch.id} branch={branch} />)
                )}
            </div>
        </div>
    );
};
