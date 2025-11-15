import React, { useState } from 'react';
import { useSystem } from '../hooks/useSystem';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Dashboard } from './Dashboard';
import { PosView } from './PosView';
import { SalesView } from './SalesView';
import { PurchasesView } from './PurchasesView';
import { InventoryView } from './InventoryView';
import { CustomersView } from './CustomersView';
import { HrView } from './HrView';
import { AttendanceView } from './AttendanceView';
import { MenuView } from './MenuView';
import { RecipesView } from './RecipesView';
import { KitchenView } from './KitchenView';
import { DeliveryView } from './DeliveryView';
import { BranchesView } from './BranchesView';
import { DailyOpsView } from './DailyOpsView';
import { PnlView } from './PnlView';
import { ReportsView } from './ReportsView';
import { SettingsView } from './SettingsView';
import { useLocalization } from '../hooks/useLocalization';

const viewMap = {
  dashboard: <Dashboard />,
  pos: <PosView />,
  sales: <SalesView />,
  purchases: <PurchasesView />,
  inventory: <InventoryView />,
  customers: <CustomersView />,
  hr: <HrView />,
  attendance: <AttendanceView />,
  menu: <MenuView />,
  recipes: <RecipesView />,
  kitchen: <KitchenView />,
  delivery: <DeliveryView />,
  branches: <BranchesView />,
  daily_ops: <DailyOpsView />,
  pnl: <PnlView />,
  reports: <ReportsView />,
  settings: <SettingsView />,
};

export const AdminApp: React.FC = () => {
  const { viewState } = useSystem();
  const { locale } = useLocalization();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const MainContent = viewMap[viewState.view] || <Dashboard />;

  return (
    <div className={`flex h-screen bg-background ${locale === 'ar-EG' ? 'rtl' : 'ltr'}`}>
      <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {MainContent}
        </main>
      </div>
    </div>
  );
};
