export type Theme = 'light' | 'dark' | 'modern' | 'glassmorphism' | 'neon' | 'classic';
export type Locale = 'ar-EG' | 'en-US';
export type View = 
  'dashboard' | 'pos' | 'sales' | 'purchases' | 'inventory' | 
  'customers' | 'hr' | 'attendance' | 'menu' | 'recipes' | 
  'kitchen' | 'delivery' | 'branches' | 'daily_ops' | 'pnl' | 
  'reports' | 'settings';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface ToastNotification {
  id: number;
  message: string;
  type: NotificationType;
}

export interface SystemNotification {
  id: number;
  message: string;
  type: 'stock' | 'hr' | 'sales';
  read: boolean;
  timestamp: Date;
  link?: {
    view: View;
    filters?: any;
  };
}

export interface KPI {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  recipeId?: string;
}

export interface PosItem extends MenuItem {
  orderItemId: number;
  quantity: number;
  notes?: string;
  modifiers?: string[];
}

export interface Table {
  id: string;
  name: string;
  status: 'Available' | 'Occupied' | 'Reserved';
  orderId?: string | null;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  branch: string;
  salary: number;
  status: 'Active' | 'On Leave' | 'Terminated';
  hireDate: string;
  phone: string;
  email: string;
  manager?: string;
  emergencyContact: { name: string; phone: string; };
  contractType: 'Full-time' | 'Part-time';
  bankDetails: { bankName: string; accountNumber: string; };
  notes?: string[];
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Annual' | 'Sick' | 'Unpaid' | 'Maternity';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
}


export interface CompanyDocument {
  id: string;
  title: string;
  category: 'Policy' | 'Announcement' | 'Guide';
  publishDate: string;
  content: string;
}

export interface HRDashboardKPIs {
  headcount: number;
  turnoverRate: number;
  attendanceRate: number;
  pendingLeaveRequests: number;
}

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  recipeId?: string;
}

export interface Invoice {
  id: string;
  customerName: string;
  branch: string;
  items: LineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  issueDate: string;
  dueDate: string;
}

export interface Quotation {
  id: string;
  customerName: string;
  branch: string;
  items: LineItem[];
  subtotal: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  issueDate: string;
  expiryDate: string;
}

export interface SalesDashboardData {
  totalRevenue: number;
  unpaidInvoices: number;
  overdueAmount: number;
  invoiceStatusCounts: { [key in Invoice['status']]?: number };
}

export interface Sale {
  id: string;
  customerName: string;
  branch: string;
  items: LineItem[];
  total: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
  date: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderLevel: number;
  supplier: string;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'unit';
  branch: string;
  costPerUnit: number;
  allergens?: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  lastOrderDate: string;
}

export interface CustomerProfile extends Customer {
  totalSpent: number;
  visitCount: number;
  favoriteItem: string;
}

export interface Payment {
  method: 'Cash' | 'Card' | 'Online' | 'Gift Card';
  amount: number;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  branch: string;
  total: number;
  status: 'Received' | 'Pending' | 'Ordered';
  date: string;
}

export interface AttendanceRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  branch: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  duration: string | null;
  status: 'Present' | 'Late' | 'Absent' | 'On Leave';
  notes?: string;
}

export interface RecipeIngredient {
  inventoryItemId?: string; // Link to InventoryItem ID
  subRecipeId?: string;   // Link to another Recipe ID
  quantity: number;
  unit: string;
  yieldPercentage: number; // e.g., 90 for 90% yield
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: RecipeIngredient[];
  isSubRecipe: boolean;
  wastagePercentage: number; // e.g., 5 for 5% wastage
  instructions: string; // New field for cooking steps
  productionYield: number; // How many units this recipe produces
  yieldUnit: string; // e.g., 'portions', 'liters', 'kg'
}


export interface KitchenOrder {
  id: string;
  destinationBranch: string;
  items: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  prepTime: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  deliveryFee: number;
  activeDrivers: number;
  avgTime: string;
}

export interface Branch {
  id: string;
  name: string;
  manager: string;
  employeeCount: number;
  dailySales: number;
}

export type PnlCategory = 'Revenue' | 'COGS' | 'Gross Profit' | 'Operating Expenses' | 'Net Profit';
export type DataSource = 'pos' | 'inventory' | 'hr' | 'manual';

export interface PnlEntry {
  id: string;
  category: PnlCategory;
  title: string;
  amount: number;
  previousAmount?: number;
  budgetAmount?: number;
  isTotal?: boolean;
  subRows?: PnlEntry[];
  dataSource?: DataSource;
  notes?: string;
}

export interface FinancialRatio {
    title: string;
    value: string;
    description: string;
}

export interface Order {
  id: string;
  tableId: string;
  customerId: string | null;
  items: PosItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'active' | 'paid' | 'cancelled';
}


export interface Report {
  id: string;
  name: string;
  description: string;
  lastGenerated: string;
}

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export type Permissions = {
    [key in View]?: PermissionAction[];
};

export interface Role {
    id: string;
    name: string;
    permissions: Permissions;
}

export interface User {
    id: string;
    name: string;
    email: string;
    roleId: string;
    employeeId?: string; // Link to Employee for non-admin users
    userType: 'admin' | 'employee';
}

export interface CostingSettings {
    laborCostPercentage: number;
    overheadCostPercentage: number;
    targetProfitMarginPercentage: number;
}

export interface SystemContextState {
    viewState: { view: View, filters: any };
    currentBranchId: string | null;
    employees: Employee[];
    inventoryItems: InventoryItem[];
    recipes: Recipe[];
    menuItems: MenuItem[];
    sales: Sale[];
    customers: Customer[];
    purchaseOrders: PurchaseOrder[];
    attendanceRecords: AttendanceRecord[];
    kitchenOrders: KitchenOrder[];
    deliveryZones: DeliveryZone[];
    branches: Branch[];
    pnlData: PnlEntry[];
    reports: Report[];
    users: User[];
    roles: Role[];
    leaveRequests: LeaveRequest[];
    systemNotifications: SystemNotification[];
    costingSettings: CostingSettings;
    loading: boolean;
}