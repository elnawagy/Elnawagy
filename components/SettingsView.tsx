import React, { useState, ReactNode } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import {
    GeneralSettingsIcon, PosIcon, FinancialSettingsIcon, UsersSettingsIcon, InventorySettingsIcon,
    IntegrationsSettingsIcon, SecuritySettingsIcon, BrandingIcon, HardwareIcon, DiningIcon, PolicyIcon, PermissionsIcon, CustomersIcon, ColorSwatchIcon,
    SalesIcon, HRIcon, ReportsIcon
} from './icons';

// Type for settings tabs
type SettingsTab = 'general' | 'pos' | 'sales' | 'financial' | 'hr' | 'users' | 'inventory' | 'customers' | 'reports' | 'integrations' | 'security';

// Reusable components for settings layout
const SettingsSection: React.FC<{ title: string; children: ReactNode; description?: string; }> = ({ title, description, children }) => (
    <div className="bg-card border border-border rounded-xl shadow-sm mb-8">
        <div className="p-4 sm:p-6 border-b border-border">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="p-4 sm:p-6 space-y-6 divide-y divide-border/50">
            {children}
        </div>
    </div>
);

const SettingsRow: React.FC<{ label: string; description?: string; children: ReactNode; isToggle?: boolean; }> = ({ label, description, children, isToggle }) => (
    <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 first:pt-0 pt-6 ${isToggle ? 'sm:items-center' : ''}`}>
        <div className="flex-shrink-0 sm:w-2/5">
            <label className="font-semibold text-foreground">{label}</label>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="flex-grow sm:w-3/5">
            {children}
        </div>
    </div>
);

const SettingsInput: React.FC<{ defaultValue?: string | number; type?: string; placeholder?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ defaultValue, type = "text", placeholder, onChange }) => (
    <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        className="block w-full bg-secondary border-border rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
    />
);

const SettingsSelect: React.FC<{ children: ReactNode; defaultValue?: string }> = ({ children, defaultValue }) => (
    <select defaultValue={defaultValue} className="block w-full bg-secondary border-border rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary">
        {children}
    </select>
);

const SettingsToggle: React.FC<{ defaultChecked?: boolean }> = ({ defaultChecked }) => (
    <div className="flex items-center justify-end">
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" defaultChecked={defaultChecked} />
            <div className="w-11 h-6 bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    </div>
);

const SettingsButton: React.FC<{ label: string }> = ({ label }) => (
     <button className="px-4 py-2 bg-secondary rounded-lg font-semibold hover:bg-accent transition-colors text-sm">{label}</button>
);


// Main Settings View Component
export const SettingsView: React.FC = () => {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    const tabs: { id: SettingsTab; label: string; icon: React.FC }[] = [
        { id: 'general', label: t('general_settings'), icon: GeneralSettingsIcon },
        { id: 'pos', label: t('pos_settings'), icon: PosIcon },
        { id: 'sales', label: t('sales_settings'), icon: SalesIcon },
        { id: 'financial', label: t('financial_settings'), icon: FinancialSettingsIcon },
        { id: 'hr', label: t('hr_settings'), icon: HRIcon },
        { id: 'users', label: t('users_roles'), icon: UsersSettingsIcon },
        { id: 'inventory', label: t('inventory_settings'), icon: InventorySettingsIcon },
        { id: 'customers', label: t('customers_settings'), icon: CustomersIcon },
        { id: 'reports', label: t('reports_settings'), icon: ReportsIcon },
        { id: 'integrations', label: t('integrations'), icon: IntegrationsSettingsIcon },
        { id: 'security', label: t('security_data'), icon: SecuritySettingsIcon },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralSettings />;
            case 'pos': return <PosSettings />;
            case 'sales': return <SalesSettings />;
            case 'financial': return <FinancialSettings />;
            case 'hr': return <HrSettings />;
            case 'users': return <UsersSettings />;
            case 'inventory': return <InventorySettings />;
            case 'customers': return <CustomersSettings />;
            case 'reports': return <ReportsSettings />;
            case 'integrations': return <IntegrationsSettings />;
            case 'security': return <SecuritySettings />;
            default: return null;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground">{t('settings')}</h1>
                <p className="mt-2 text-muted-foreground">{t('settings_subtitle')}</p>
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-8">
                {/* Tabs Sidebar */}
                <aside className="md:w-1/4 lg:w-1/5 flex-shrink-0">
                    <ul className="space-y-1">
                        {tabs.map((tab) => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition-colors text-left rtl:text-right ${
                                        activeTab === tab.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-foreground hover:bg-secondary'
                                    }`}
                                >
                                    <tab.icon />
                                    <span>{tab.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Content */}
                <main className="flex-1">
                    {renderContent()}
                    <div className="flex justify-end mt-8">
                        <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity">
                            {t('save_changes')}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Component for each settings tab for better organization
const GeneralSettings = () => {
    const { t } = useLocalization();
    return <>
        <SettingsSection title={t('company_profile')}>
            <SettingsRow label={t('company_name')}><SettingsInput defaultValue="My Restaurant Chain" /></SettingsRow>
            <SettingsRow label={t('company_logo')}>
                <div className="flex items-center gap-4">
                    <img src="https://picsum.photos/seed/logo/80" alt="logo" className="w-16 h-16 rounded-md object-cover" />
                    <SettingsButton label={t('change_logo')} />
                </div>
            </SettingsRow>
            <SettingsRow label={t('company_address')}><SettingsInput defaultValue="123 Nile St, Cairo, Egypt" /></SettingsRow>
            <SettingsRow label={t('contact_email')}><SettingsInput type="email" defaultValue="contact@myrestaurant.com" /></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('branding')}>
            <SettingsRow label={t('primary_color')}>
                 <div className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                    <ColorSwatchIcon />
                    <input type="color" defaultValue="#6366f1" className="bg-transparent border-none" />
                    <span className="font-mono text-sm">#6366F1</span>
                </div>
            </SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('branch_settings')}>
            <SettingsRow label={t('opening_hours')}><SettingsInput defaultValue="9:00 AM - 11:00 PM" /></SettingsRow>
             <SettingsRow label={t('allow_inter_branch_transfers')} isToggle><SettingsToggle defaultChecked/></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('regional_settings')}>
            <SettingsRow label={t('number_format')}><SettingsSelect><option>1,234.56</option><option>1.234,56</option></SettingsSelect></SettingsRow>
            <SettingsRow label={t('weight_unit')}><SettingsSelect><option>{t('kilogram')}</option><option>{t('pound')}</option></SettingsSelect></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('system_behavior')}>
            <SettingsRow label={t('maintenance_mode')} description={t('maintenance_mode_desc')} isToggle><SettingsToggle /></SettingsRow>
            <SettingsRow label={t('auto_logout_minutes')}><SettingsInput type="number" defaultValue="60" /></SettingsRow>
            <SettingsRow label={t('sync_branch_data_interval')}><SettingsInput type="number" defaultValue="5" /></SettingsRow>
        </SettingsSection>
    </>;
};

const PosSettings = () => {
    const { t } = useLocalization();
    return <>
        <SettingsSection title={t('connected_devices')}>
           <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-left rtl:text-right text-muted-foreground">
                        <tr>
                            <th className="p-2 font-semibold">{t('device_name')}</th>
                            <th className="p-2 font-semibold">{t('ip_address')}</th>
                            <th className="p-2 font-semibold">{t('device_status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t border-border">
                            <td className="p-2">Receipt Printer 1</td><td className="p-2">192.168.1.100</td><td className="p-2"><span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-600">{t('online_status')}</span></td>
                        </tr>
                         <tr className="border-t border-border">
                            <td className="p-2">Kitchen Display</td><td className="p-2">192.168.1.102</td><td className="p-2"><span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-600">{t('offline_status')}</span></td>
                        </tr>
                    </tbody>
                </table>
           </div>
           <SettingsRow label=""><SettingsButton label={t('add_device')} /></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('dining_options')}>
            <SettingsRow label={t('enable_table_management')} isToggle><SettingsToggle defaultChecked /></SettingsRow>
            <SettingsRow label={t('upload_floor_plan')}><SettingsButton label="Upload" /></SettingsRow>
             <SettingsRow label={t('table_status_colors')}>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2"><input type="color" defaultValue="#4ade80" className="w-8 h-8"/><span>{t('available')}</span></div>
                    <div className="flex items-center gap-2"><input type="color" defaultValue="#f87171" className="w-8 h-8"/><span>{t('occupied')}</span></div>
                    <div className="flex items-center gap-2"><input type="color" defaultValue="#60a5fa" className="w-8 h-8"/><span>{t('reserved')}</span></div>
                </div>
            </SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('offline_mode_settings')}>
            <SettingsRow label={t('offline_sync_policy')}><SettingsSelect><option>Sync when back online</option></SettingsSelect></SettingsRow>
            <SettingsRow label={t('max_offline_transactions')}><SettingsInput type="number" defaultValue="100" /></SettingsRow>
        </SettingsSection>
         <SettingsSection title={t('self_service_kiosk')}>
            <SettingsRow label={t('enable_kiosk_mode')} isToggle><SettingsToggle/></SettingsRow>
            <SettingsRow label={t('kiosk_menu_profile')}><SettingsSelect><option>Full Menu</option><option>Limited Menu</option></SettingsSelect></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('receipt_customization')}>
            <SettingsRow label={t('header_text')}><SettingsInput placeholder="Welcome!" /></SettingsRow>
            <SettingsRow label={t('footer_text')}><SettingsInput placeholder="Thank you!" /></SettingsRow>
            <SettingsRow label={t('show_vat_on_receipt')} isToggle><SettingsToggle defaultChecked /></SettingsRow>
        </SettingsSection>
    </>;
};

const SalesSettings = () => {
    const {t} = useLocalization();
    return <>
         <SettingsSection title={t('invoice_customization')}>
            <SettingsRow label={t('invoice_prefix')}><SettingsInput defaultValue="INV-" /></SettingsRow>
            <SettingsRow label={t('next_invoice_number')}><SettingsInput type="number" defaultValue="1001" /></SettingsRow>
            <SettingsRow label={t('show_logo_on_invoice')} isToggle><SettingsToggle defaultChecked/></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('quotation_settings')}>
            <SettingsRow label={t('quotation_validity_days')}><SettingsInput type="number" defaultValue="15" /></SettingsRow>
            <SettingsRow label={t('default_quotation_terms')}><textarea className="block w-full bg-secondary border-border rounded-md shadow-sm p-2" rows={3}></textarea></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('sales_channels')}>
            <SettingsRow label={t('enable_online_sales')} isToggle><SettingsToggle/></SettingsRow>
        </SettingsSection>
    </>
}
const HrSettings = () => {
    const {t} = useLocalization();
    return <>
        <SettingsSection title={t('payroll_settings')}>
            <SettingsRow label={t('payroll_cycle')}><SettingsSelect><option>{t('monthly_cycle')}</option><option>{t('weekly_cycle')}</option></SettingsSelect></SettingsRow>
            <SettingsRow label={t('payday')}><SettingsInput type="number" defaultValue="28" /></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('leave_management')}>
            <SettingsRow label={t('define_leave_types')}><SettingsButton label="Manage Leave Types"/></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('overtime_policy')}>
            <SettingsRow label={t('overtime_rate')}><SettingsInput type="number" defaultValue="1.5" /></SettingsRow>
        </SettingsSection>
    </>
}

const FinancialSettings = () => {
    const { t } = useLocalization();
    const { costingSettings } = useSystem();
    
    const [labor, setLabor] = useState(costingSettings.laborCostPercentage);
    const [overhead, setOverhead] = useState(costingSettings.overheadCostPercentage);
    const [profit, setProfit] = useState(costingSettings.targetProfitMarginPercentage);
    
    const targetFoodCost = 100 - (labor + overhead + profit);

    return <>
        <SettingsSection title={t('tax_settings')}>
            <SettingsRow label={t('vat_percentage')}><SettingsInput type="number" defaultValue="14" /></SettingsRow>
            <SettingsRow label={t('service_charge')}><SettingsInput type="number" defaultValue="12" /></SettingsRow>
            <SettingsRow label={t('tax_reg_number')}><SettingsInput defaultValue="123-456-789" /></SettingsRow>
            <SettingsRow label={t('tax_inclusive_pricing')} description={t('tax_inclusive_pricing_desc')} isToggle><SettingsToggle /></SettingsRow>
        </SettingsSection>

        <SettingsSection title={t('costing_strategy')} description={t('costing_strategy_desc')}>
            <SettingsRow label={t('labor_cost_perc')}>
                <SettingsInput type="number" defaultValue={labor} onChange={(e) => setLabor(parseFloat(e.target.value) || 0)} />
            </SettingsRow>
            <SettingsRow label={t('overhead_cost_perc')}>
                <SettingsInput type="number" defaultValue={overhead} onChange={(e) => setOverhead(parseFloat(e.target.value) || 0)} />
            </SettingsRow>
            <SettingsRow label={t('target_profit_margin')}>
                <SettingsInput type="number" defaultValue={profit} onChange={(e) => setProfit(parseFloat(e.target.value) || 0)} />
            </SettingsRow>
            <SettingsRow label={t('target_food_cost_perc')} description={t('target_food_cost_desc')}>
                <div className="p-3 bg-secondary rounded-lg text-center">
                    <span className="text-2xl font-bold text-primary">{targetFoodCost.toFixed(2)}%</span>
                </div>
            </SettingsRow>
        </SettingsSection>

         <SettingsSection title={t('multi_currency')}>
            <SettingsRow label={t('enable_multi_currency')} isToggle><SettingsToggle /></SettingsRow>
            <SettingsRow label=""><SettingsButton label={t('add_currency')}/></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('accounting')}>
            <SettingsRow label={t('fiscal_year_start')}><SettingsInput type="date" /></SettingsRow>
            <SettingsRow label={t('chart_of_accounts_mapping')}><SettingsButton label={t('map_now')} /></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('expense_approval_workflow')}>
            <SettingsRow label={t('require_approval_for_expenses_over')}><SettingsInput type="number" defaultValue="1000" /></SettingsRow>
            <SettingsRow label={t('require_receipt_for_expenses')} description={t('require_receipt_for_expenses_desc')} isToggle><SettingsToggle defaultChecked /></SettingsRow>
        </SettingsSection>
    </>;
};

const UsersSettings = () => {
    const { t } = useLocalization();
    const modules = ['Sales', 'Purchases', 'Inventory', 'Customers', 'HR', 'Reports', 'Settings'];
    const actions = ['view', 'create', 'edit', 'delete'];
    const roles = ['Admin', 'Manager', 'Cashier', 'Accountant'];

    return <>
        <SettingsSection title={t('user_management')}>
            <SettingsRow label={t('default_role_for_new_users')}><SettingsSelect><option>{t('cashier_role')}</option><option>{t('waiter_role')}</option></SettingsSelect></SettingsRow>
            <SettingsRow label=""><div className="flex gap-2"><SettingsButton label={t('invite_user')} /><SettingsButton label={t('add_role')} /></div></SettingsRow>
        </SettingsSection>
        
        <SettingsSection title={t('permission_matrix')} description={t('permission_matrix_desc')}>
            <div className="overflow-x-auto -mx-6">
                <table className="w-full min-w-[700px] text-sm text-center">
                    <thead className="bg-secondary">
                        <tr>
                            <th className="p-2 font-semibold text-left rtl:text-right sticky ltr:left-0 rtl:right-0 bg-secondary">{t('module')} / {t('actions')}</th>
                            {roles.map(role => <th key={role} className="p-2 font-semibold">{role}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {modules.map(module => (
                            <React.Fragment key={module}>
                                <tr className="bg-secondary/50">
                                    <td colSpan={roles.length + 1} className="p-2 font-bold text-left rtl:text-right sticky ltr:left-0 rtl:right-0 bg-secondary/50">{t(module.toLowerCase() as any)}</td>
                                </tr>
                                {actions.map((action) => (
                                    <tr key={`${module}-${action}`} className="hover:bg-accent">
                                        <td className="p-2 text-muted-foreground text-left rtl:text-right capitalize sticky ltr:left-0 rtl:right-0 bg-card">{t(action as any)}</td>
                                        {roles.map(role => (
                                            <td key={`${module}-${action}-${role}`} className="p-0">
                                                <label className="w-full h-full flex items-center justify-center p-2 cursor-pointer">
                                                    <input type="checkbox" className="h-5 w-5 rounded text-primary focus:ring-primary bg-secondary border-border" defaultChecked={role === 'Admin' || (role==='Manager' && module !== 'Settings')} />
                                                </label>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                             </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </SettingsSection>
        <SettingsSection title={t('special_permissions')}>
            <SettingsRow label={t('can_process_refunds')} isToggle><SettingsToggle defaultChecked/></SettingsRow>
            <SettingsRow label={t('can_view_financials')} isToggle><SettingsToggle defaultChecked/></SettingsRow>
            <SettingsRow label={t('access_during_maintenance')} isToggle><SettingsToggle/></SettingsRow>
            <SettingsRow label={t('export_sensitive_data')} isToggle><SettingsToggle/></SettingsRow>
        </SettingsSection>
    </>;
};


const InventorySettings = () => {
    const { t } = useLocalization();
    return <>
        <SettingsSection title={t('low_stock_alerts')}>
            <SettingsRow label={t('send_email_alerts')} isToggle><SettingsToggle defaultChecked /></SettingsRow>
            <SettingsRow label={t('alert_recipients')}><SettingsInput placeholder="manager@example.com, purchasing@example.com" /></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('expiration_date_tracking')}>
            <SettingsRow label={t('alert_before_expiry_days')}><SettingsInput type="number" defaultValue="7" /></SettingsRow>
        </SettingsSection>
         <SettingsSection title={t('stock_take_settings')}>
            <SettingsRow label={t('schedule_monthly_stock_takes')} isToggle><SettingsToggle /></SettingsRow>
            <SettingsRow label={t('enable_blind_stock_takes')} isToggle><SettingsToggle /></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('recipe_production')}>
            <SettingsRow label={t('auto_deduct_inventory_on_sale')} isToggle><SettingsToggle defaultChecked /></SettingsRow>
            <SettingsRow label={t('auto_generate_po_on_low_stock')} isToggle><SettingsToggle /></SettingsRow>
            <SettingsRow label={t('wastage_tracking_method')}><SettingsSelect><option>{t('manual_entry')}</option><option>{t('percentage_of_sales')}</option></SettingsSelect></SettingsRow>
        </SettingsSection>
    </>;
};

const CustomersSettings = () => {
    const { t } = useLocalization();
    return <>
        <SettingsSection title={t('loyalty_program')}>
            <SettingsRow label={t('points_per_egp')}><SettingsInput type="number" defaultValue="1" /></SettingsRow>
            <SettingsRow label={t('points_expiry_months')}><SettingsInput type="number" defaultValue="12" /></SettingsRow>
            <SettingsRow label={t('loyalty_tiers')}><SettingsButton label={t('add_tier')}/></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('gift_card_settings')}>
            <SettingsRow label={t('enable_gift_cards')} isToggle><SettingsToggle/></SettingsRow>
            <SettingsRow label={t('gift_card_expiry_months')}><SettingsInput type="number" defaultValue="24" /></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('crm_marketing')}>
             <SettingsRow label={t('enable_automatic_birthday_offers')} isToggle><SettingsToggle /></SettingsRow>
             <SettingsRow label={t('enable_sms_marketing_opt_in')} isToggle><SettingsToggle /></SettingsRow>
             <SettingsRow label={t('customer_tags_segmentation')}><SettingsButton label={t('manage_tags')} /></SettingsRow>
        </SettingsSection>
         <SettingsSection title={t('data_privacy')}>
            <SettingsRow label={t('anonymize_inactive_customers')}><SettingsInput type="number" defaultValue="36" /></SettingsRow>
            <SettingsRow label={t('customer_data_export')}><SettingsButton label={t('export_csv')} /></SettingsRow>
        </SettingsSection>
    </>;
};

const ReportsSettings = () => {
    const { t } = useLocalization();
    return <>
        <SettingsSection title={t('default_reporting_period')}>
            <SettingsRow label={t('date_range')}>
                <SettingsSelect>
                    <option>{t('last_30_days')}</option>
                    <option>{t('month_to_date')}</option>
                    <option>{t('last_7_days')}</option>
                </SettingsSelect>
            </SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('export_settings')}>
            <SettingsRow label={t('include_logo_in_pdf')} isToggle><SettingsToggle defaultChecked /></SettingsRow>
            <SettingsRow label={t('csv_delimiter')}>
                <SettingsSelect>
                    <option value=",">{t('comma')} (,)</option>
                    <option value=";">{t('semicolon')} (;)</option>
                </SettingsSelect>
            </SettingsRow>
        </SettingsSection>
         <SettingsSection title={t('conditional_alerts')}>
             <SettingsRow label={t('alert_me_if')}><SettingsInput placeholder="Total Sales < 5000" /></SettingsRow>
        </SettingsSection>
    </>
}

const IntegrationsSettings = () => {
    const { t } = useLocalization();
    return <>
        <SettingsSection title={t('delivery_integrations')}>
            <SettingsRow label="Talabat" isToggle><SettingsToggle /></SettingsRow>
            <SettingsRow label="Glovo" isToggle><SettingsToggle /></SettingsRow>
            <SettingsRow label={t('auto_accept_delivery_orders')} isToggle><SettingsToggle /></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('smtp_settings')}>
            <SettingsRow label={t('smtp_host')}><SettingsInput placeholder="smtp.example.com"/></SettingsRow>
            <SettingsRow label={t('smtp_port')}><SettingsInput type="number" placeholder="587"/></SettingsRow>
            <SettingsRow label={t('smtp_user')}><SettingsInput/></SettingsRow>
            <SettingsRow label={t('smtp_password')}><SettingsInput type="password" /></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('notifications')}>
             <SettingsRow label={t('webhook_url')} description={t('webhook_url_desc')}><SettingsInput placeholder="https://hooks.slack.com/..."/></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('api_access')}>
             <SettingsRow label={t('enable_api_access')} isToggle><SettingsToggle /></SettingsRow>
             <SettingsRow label=""><SettingsButton label={t('generate_api_key')} /></SettingsRow>
        </SettingsSection>
    </>;
};

const SecuritySettings = () => {
    const { t } = useLocalization();
    return <>
        <SettingsSection title={t('password_policy')}>
            <SettingsRow label={t('min_length')}><SettingsInput type="number" defaultValue="8" /></SettingsRow>
            <SettingsRow label={t('require_uppercase')} isToggle><SettingsToggle defaultChecked /></SettingsRow>
            <SettingsRow label={t('require_number')} isToggle><SettingsToggle defaultChecked /></SettingsRow>
            <SettingsRow label={t('require_special_character')} isToggle><SettingsToggle /></SettingsRow>
            <SettingsRow label={t('password_expiry_days')}><SettingsInput type="number" defaultValue="90" /></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('two_factor_auth')}>
             <SettingsRow label={t('enforce_2fa_for_roles')}><SettingsInput placeholder="Admin, Manager"/></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('audit_log_and_logging')}>
            <SettingsRow label={t('log_level')}>
                <SettingsSelect>
                    <option>{t('basic')}</option>
                    <option>{t('detailed')}</option>
                </SettingsSelect>
            </SettingsRow>
             <SettingsRow label=""><SettingsButton label={t('view_audit_log')} /></SettingsRow>
        </SettingsSection>
        <SettingsSection title={t('data_management')}>
            <SettingsRow label={t('automatic_backup_frequency')}>
                <SettingsSelect>
                    <option>{t('daily')}</option>
                    <option>{t('weekly')}</option>
                    <option>{t('monthly')}</option>
                </SettingsSelect>
            </SettingsRow>
            <SettingsRow label={t('data_retention_policy_months')}><SettingsInput type="number" defaultValue="24" /></SettingsRow>
            <SettingsRow label=""><SettingsButton label={t('backup_now')} /></SettingsRow>
        </SettingsSection>
    </>;
};