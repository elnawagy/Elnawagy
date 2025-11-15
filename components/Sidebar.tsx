
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import { usePermissions } from '../hooks/usePermissions';
import type { View } from '../types';
import { 
  DashboardIcon, PosIcon, SalesIcon, PurchasesIcon, InventoryIcon, CustomersIcon, 
  HRIcon, AttendanceIcon, MenuIcon, RecipesIcon, KitchenIcon, DeliveryIcon, 
  BranchesIcon, DailyOpsIcon, PnlIcon, ReportsIcon, SettingsIcon 
} from './icons';

interface SidebarProps {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
}

const navItems: { view: View; icon: React.FC }[] = [
  { view: 'dashboard', icon: DashboardIcon },
  { view: 'pos', icon: PosIcon },
  { view: 'sales', icon: SalesIcon },
  { view: 'purchases', icon: PurchasesIcon },
  { view: 'inventory', icon: InventoryIcon },
  { view: 'customers', icon: CustomersIcon },
  { view: 'hr', icon: HRIcon },
  { view: 'attendance', icon: AttendanceIcon },
  { view: 'menu', icon: MenuIcon },
  { view: 'recipes', icon: RecipesIcon },
  { view: 'kitchen', icon: KitchenIcon },
  { view: 'delivery', icon: DeliveryIcon },
  { view: 'branches', icon: BranchesIcon },
  { view: 'daily_ops', icon: DailyOpsIcon },
  { view: 'pnl', icon: PnlIcon },
  { view: 'reports', icon: ReportsIcon },
  { view: 'settings', icon: SettingsIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, closeSidebar }) => {
  const { t, locale } = useLocalization();
  const { viewState, setView } = useSystem();
  const { hasPermission } = usePermissions();
  const currentView = viewState.view;

  const baseClasses = "fixed top-0 z-40 h-screen bg-card border-border transition-transform duration-300 ease-in-out w-64";
  const positionClasses = locale === 'ar-EG' ? "right-0 border-l" : "left-0 border-r";
  const transformClasses = isSidebarOpen ? "translate-x-0" : (locale === 'ar-EG' ? "translate-x-full" : "-translate-x-full");
  
  const handleSetView = (view: View) => {
    setView(view);
    closeSidebar();
  }

  const visibleNavItems = navItems.filter(item => hasPermission(item.view, 'view'));

  return (
    <aside className={`${baseClasses} ${positionClasses} ${transformClasses} lg:translate-x-0 lg:static`}>
      <div className="h-full px-3 py-4 overflow-y-auto">
        <div className="flex items-center ps-2.5 mb-5">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
          <span className="self-center text-xl font-semibold whitespace-nowrap text-foreground ms-3">{t('system_name')}</span>
        </div>
        <ul className="space-y-2 font-medium">
          {visibleNavItems.map((item) => (
            <li key={item.view}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleSetView(item.view); }}
                className={`flex items-center p-3 rounded-lg group transition-colors duration-200 ${
                  currentView === item.view
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <item.icon />
                <span className="ms-3">{t(item.view)}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};
