import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { SystemContextState, View, SystemNotification, Branch, MenuItem, Recipe } from '../types';
import { generateAllData } from '../services/geminiService';

// Define the shape of the context value
interface SystemContextValue extends SystemContextState {
  setView: (view: View, filters?: any) => void;
  setCurrentBranch: (branchId: string) => void;
  markAllNotificationsAsRead: () => void;
  addMenuItem: (newItem: MenuItem) => void;
  addRecipe: (newRecipe: Recipe) => void;
  updateRecipe: (updatedRecipe: Recipe) => void;
  deleteRecipe: (recipeId: string) => void;
}

// Create the context
export const SystemContext = createContext<SystemContextValue | undefined>(undefined);

// Initial state
const initialState: SystemContextState = {
  viewState: { view: 'dashboard', filters: {} },
  currentBranchId: null,
  employees: [],
  inventoryItems: [],
  recipes: [],
  menuItems: [],
  sales: [],
  customers: [],
  purchaseOrders: [],
  attendanceRecords: [],
  kitchenOrders: [],
  deliveryZones: [],
  branches: [],
  pnlData: [],
  reports: [],
  users: [],
  roles: [],
  leaveRequests: [],
  systemNotifications: [],
  costingSettings: {
      laborCostPercentage: 30,
      overheadCostPercentage: 20,
      targetProfitMarginPercentage: 15,
  },
  loading: true,
};

// Create the provider component
export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SystemContextState>(initialState);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allData = await generateAllData();
        
        // Create a mock low stock notification
        const lowStockItem = allData.inventoryItems.find(item => item.stock < item.reorderLevel);
        const initialNotifications: SystemNotification[] = [];
        if (lowStockItem) {
          initialNotifications.push({
            id: 1,
            message: `${lowStockItem.name} is low on stock (${lowStockItem.stock} ${lowStockItem.unit} remaining).`,
            type: 'stock',
            read: false,
            timestamp: new Date(),
            link: { view: 'inventory', filters: { status: 'low_stock' } },
          });
        }

        setState({
          ...allData,
          viewState: { view: 'dashboard', filters: {} },
          currentBranchId: allData.branches[0]?.id || null,
          systemNotifications: initialNotifications,
          costingSettings: initialState.costingSettings, // Keep defaults
          loading: false,
        });
      } catch (error) {
        console.error("Failed to load system data:", error);
        setState(s => ({ ...s, loading: false }));
      }
    };

    loadData();
  }, []);

  const setView = useCallback((view: View, filters: any = {}) => {
    setState(s => ({ ...s, viewState: { view, filters } }));
  }, []);
  
  const setCurrentBranch = useCallback((branchId: string) => {
    setState(s => ({ ...s, currentBranchId: branchId }));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setState(s => ({
      ...s,
      systemNotifications: s.systemNotifications.map(n => ({ ...n, read: true })),
    }));
  }, []);

  const addMenuItem = useCallback((newItem: MenuItem) => {
    setState(s => ({
        ...s,
        menuItems: [...s.menuItems, newItem]
    }));
  }, []);

  const addRecipe = useCallback((newRecipe: Recipe) => {
    setState(s => ({ ...s, recipes: [...s.recipes, newRecipe] }));
  }, []);

  const updateRecipe = useCallback((updatedRecipe: Recipe) => {
      setState(s => ({ ...s, recipes: s.recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r) }));
  }, []);

  const deleteRecipe = useCallback((recipeId: string) => {
      setState(s => ({ ...s, recipes: s.recipes.filter(r => r.id !== recipeId) }));
  }, []);

  return (
    <SystemContext.Provider value={{ ...state, setView, setCurrentBranch, markAllNotificationsAsRead, addMenuItem, addRecipe, updateRecipe, deleteRecipe }}>
      {children}
    </SystemContext.Provider>
  );
};