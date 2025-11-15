
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { generateDeliveryZones } from '../services/geminiService';
import type { DeliveryZone } from '../types';
import { PlusIcon } from './icons';

const ZoneCard: React.FC<{ zone: DeliveryZone }> = ({ zone }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-card border border-border rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-lg text-foreground truncate">{zone.name}</h3>
            <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('delivery_fee')}:</span>
                    <span className="font-semibold">EGP {zone.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('active_drivers')}:</span>
                    <span className="font-semibold">{zone.activeDrivers}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('avg_delivery_time')}:</span>
                    <span className="font-semibold">{zone.avgTime}</span>
                </div>
            </div>
        </div>
    );
};

export const DeliveryView: React.FC = () => {
    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLocalization();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await generateDeliveryZones();
            setZones(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">{t('delivery_management')}</h1>
                    <p className="mt-2 text-muted-foreground">{t('delivery_subtitle')}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
                    <PlusIcon />
                    {t('add_zone')}
                </button>
            </div>
             <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    [...Array(8)].map((_, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                            <div className="h-6 bg-secondary rounded w-3/4"></div>
                            <div className="h-4 bg-secondary rounded w-full mt-4"></div>
                            <div className="h-4 bg-secondary rounded w-full mt-2"></div>
                             <div className="h-4 bg-secondary rounded w-full mt-2"></div>
                        </div>
                    ))
                ) : (
                    zones.map(zone => <ZoneCard key={zone.id} zone={zone} />)
                )}
            </div>
        </div>
    );
};
