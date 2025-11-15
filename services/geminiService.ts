
import { GoogleGenAI, Type } from "@google/genai";
import type { KPI, MenuItem, Employee, Sale, InventoryItem, Customer, PurchaseOrder, AttendanceRecord, Recipe, KitchenOrder, DeliveryZone, Branch, PnlEntry, Report, SalesDashboardData, HRDashboardKPIs, Invoice, Quotation, User, Role, LeaveRequest, Permissions, FinancialRatio } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Using a placeholder. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Flag to disable API calls after a quota error to prevent repeated error messages.
let isApiDisabled = false;

const generateContentWithFallback = async (prompt: string, schema: any, fallbackData: any) => {
  if (!API_KEY || isApiDisabled) {
    if (isApiDisabled) {
        console.log("Gemini API calls disabled due to previous quota error. Using fallback data.");
    } else {
        console.log("Using fallback data due to missing API key for prompt:", prompt);
    }
    return fallbackData;
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error: any) {
    console.error("Error generating content with Gemini, returning fallback data. Error:", error);
    // If the error is a quota error, disable future API calls for this session.
    const errorString = JSON.stringify(error).toLowerCase();
    if (errorString.includes('quota') || errorString.includes('resource_exhausted')) {
        console.warn("Quota exceeded. Disabling further Gemini API calls for this session.");
        isApiDisabled = true;
    }
    return fallbackData;
  }
};

// --- DATA GENERATION FOR SYSTEM CONTEXT ---

export const generateAllData = async () => {
    console.log("Generating all initial data for the system...");
    // We run these in parallel to speed up the initial load.
    const [
        employees,
        inventoryItems,
        recipes,
        menuItems,
        sales,
        customers,
        purchaseOrders,
        attendanceRecords,
        kitchenOrders,
        deliveryZones,
        branches,
        pnlData,
        reports,
        roles,
        users,
        leaveRequests
    ] = await Promise.all([
        generateEmployees(),
        generateInventoryData(),
        generateRecipes(),
        generateMenuItems(),
        generateSalesData(),
        generateCustomersData(),
        generatePurchaseOrders(),
        generateAttendanceRecords(),
        generateKitchenOrders(),
        generateDeliveryZones(),
        generateBranchesData(),
        generatePnlData(),
        generateReportsList(),
        generateRolesAndPermissions(),
        generateUsers(),
        generateLeaveRequests(),
    ]);
    
    // Post-processing to ensure relationships are consistent
    const finalMenuItems = menuItems.map((item, index) => ({
        ...item,
        recipeId: recipes[index % recipes.length]?.id // Link menu items to recipes
    }));

    return {
        employees,
        inventoryItems,
        recipes,
        menuItems: finalMenuItems,
        sales,
        customers,
        purchaseOrders,
        attendanceRecords,
        kitchenOrders,
        deliveryZones,
        branches,
        pnlData,
        reports,
        roles,
        users,
        leaveRequests,
    };
}


export const generateDashboardKpis = async (branchName?: string): Promise<KPI[]> => {
  const branchContext = branchName ? `for the '${branchName}' branch` : `for a mid-sized Egyptian restaurant`;
  const prompt = `Generate 4 realistic key performance indicators (KPIs) ${branchContext} for today. The titles must be in English to be used as translation keys (e.g., 'total_sales', 'new_customers', 'avg_order_value', 'top_selling_item'). Provide a precise value (e.g., EGP amount, number of customers), a change percentage from yesterday, and whether that change is an increase or decrease. The currency should be EGP.`;
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Title of the KPI in English as a key (e.g., total_sales)' },
        value: { type: Type.STRING, description: 'Value of the KPI, with currency' },
        change: { type: Type.STRING, description: 'Percentage change from yesterday' },
        changeType: { type: Type.STRING },
      },
      required: ["title", "value", "change", "changeType"],
    },
  };
  const fallbackData = [
    { title: "total_sales", value: "25,480 ج.م", change: "+15%", changeType: 'increase' },
    { title: "new_customers", value: "32", change: "+5%", changeType: 'increase' },
    { title: "avg_order_value", value: "250.75 ج.م", change: "-2%", changeType: 'decrease' },
    { title: "top_selling_item", value: "كشري مخصوص", change: "+10%", changeType: 'increase' },
  ];
  return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generateMenuItems = async (): Promise<MenuItem[]> => {
    const prompt = "Generate 10 creative, modern Egyptian fusion menu items. For each item, provide a unique ID (e.g. 'menu-001'), a name in Egyptian Arabic, a short compelling description in Egyptian Arabic, a realistic price in EGP, and a category in Egyptian Arabic (e.g., 'مقبلات', 'طبق رئيسي', 'حلويات').";
    const schema = {
        type: Type.ARRAY,
        items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            price: { type: Type.NUMBER },
            category: { type: Type.STRING },
        },
        required: ["id", "name", "description", "price", "category"],
        },
    };
    const fallbackData = [
        { id: "menu-001", name: "كشري بالزعفران وماء الورد", description: "لمسة فاخرة على طبق أصيل، برز بالزعفران ونكهة ماء الورد في صلصة الطماطم.", price: 120, category: "طبق رئيسي" },
        { id: "menu-002", name: "سلايدرز حواوشي بصوص البلسمك", description: "لحم مفروم متبل في عيش بلدي صغير، مع طبقة من صوص البلسمك الحلو.", price: 95, category: "مقبلات" },
    ];
    return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generateEmployees = async (): Promise<Employee[]> => {
    const prompt = "Generate a list of 15 realistic employees for a multi-branch restaurant chain in Egypt. Provide a unique ID (string, e.g. 'emp-001'), a full Egyptian Arabic name, a job position in Arabic (e.g., 'شيف', 'ويتر', 'مدير فرع'), the branch name ('فرع الزمالك', 'فرع المعادي'), a realistic monthly salary in EGP (number), and a status ('Active', 'On Leave'). Also include hireDate, phone, email.";
    const schema = {
        type: Type.ARRAY,
        items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            position: { type: Type.STRING },
            branch: { type: Type.STRING },
            salary: { type: Type.NUMBER },
            status: { type: Type.STRING },
            hireDate: { type: Type.STRING },
            phone: { type: Type.STRING },
            email: { type: Type.STRING },
        },
        required: ["id", "name", "position", "branch", "salary", "status", "hireDate", "phone", "email"],
        },
    };
    const fallbackData = [
        { id: 'emp-001', name: 'أحمد محمود', position: 'مدير فرع', branch: 'فرع الزمالك', salary: 12000, status: 'Active', hireDate: '2020-05-15', phone: '010-1111-2222', email: 'ahmed.mahmoud@example.com' },
        { id: 'emp-002', name: 'فاطمة علي', position: 'شيف', branch: 'فرع المعادي', salary: 9500, status: 'Active', hireDate: '2021-02-20', phone: '010-3333-4444', email: 'fatma.ali@example.com' },
        { id: 'emp-003', name: 'كريم عادل', position: 'ويتر', branch: 'فرع الزمالك', salary: 4500, status: 'On Leave', hireDate: '2022-08-10', phone: '010-5555-6666', email: 'karim.adel@example.com' },
        { id: 'emp-004', name: 'سارة مصطفى', position: 'كاشير', branch: 'فرع المعادي', salary: 5000, status: 'Active', hireDate: '2021-11-01', phone: '010-7777-8888', email: 'sara.mostafa@example.com' },
    ];
    return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generateSalesData = async (): Promise<Sale[]> => {
    const prompt = "Generate a list of 20 realistic sales orders for a restaurant. Provide a unique ID, a customer's full Egyptian name, branch name ('فرع الزمالك' or 'فرع المعادي'), total amount in EGP, status ('Completed', 'Pending', or 'Cancelled'), and a recent date string (e.g., '2023-10-27 14:30'). Each sale should have a list of line items with name, quantity, unitPrice and total.";
    const schema = {
        type: Type.ARRAY,
        items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            customerName: { type: Type.STRING },
            branch: { type: Type.STRING },
            total: { type: Type.NUMBER },
            status: { type: Type.STRING },
            date: { type: Type.STRING },
            items: { 
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        unitPrice: { type: Type.NUMBER },
                        total: { type: Type.NUMBER },
                    },
                    required: ["id", "name", "quantity", "unitPrice", "total"]
                }
            }
        },
        required: ["id", "customerName", "branch", "total", "status", "date", "items"],
        },
    };
    const fallbackData = [
        { id: 'SALE-001', customerName: 'خالد المصري', branch: 'فرع المعادي', total: 450.50, status: 'Completed', date: '2023-10-27 14:30', items: [{id: 'menu-001', name: 'كشري', quantity: 2, unitPrice: 75, total: 150}] },
        { id: 'SALE-002', customerName: 'منى شوقي', branch: 'فرع الزمالك', total: 120.00, status: 'Pending', date: '2023-10-27 15:00', items: [] },
        { id: 'SALE-003', customerName: 'علي حسن', branch: 'فرع المعادي', total: 85.75, status: 'Cancelled', date: '2023-10-26 18:00', items: [] },
    ];
    return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generateInventoryData = async (): Promise<InventoryItem[]> => {
    const prompt = "Generate a list of 20 realistic inventory items for a multi-branch Egyptian restaurant. For each, provide a unique ID (e.g. 'inv-001'), item name in Egyptian Arabic, category in Arabic (e.g., 'خضروات', 'لحوم'), current stock level (number), reorder level (number, lower than stock), a supplier name, a unit ('kg', 'g', 'L', 'ml', 'unit'), a realistic cost per unit in EGP for the specified unit, the branch name it belongs to ('فرع الزمالك' or 'فرع المعادي'), and a list of common allergens as a string array (e.g., ['Dairy', 'Gluten']). If no allergens, provide an empty array.";
    const schema = {
        type: Type.ARRAY,
        items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            stock: { type: Type.NUMBER },
            reorderLevel: { type: Type.NUMBER },
            supplier: { type: Type.STRING },
            unit: { type: Type.STRING },
            costPerUnit: { type: Type.NUMBER },
            branch: { type: Type.STRING },
            allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["id", "name", "category", "stock", "reorderLevel", "supplier", "unit", "costPerUnit", "branch", "allergens"],
        },
    };
    const fallbackData = [
        { id: 'inv-001', name: 'طماطم', category: 'خضروات', stock: 50, reorderLevel: 20, supplier: 'مزارع فريش', unit: 'kg', costPerUnit: 15, branch: 'فرع المعادي', allergens: [] },
        { id: 'inv-002', name: 'صدور فراخ', category: 'لحوم', stock: 25, reorderLevel: 15, supplier: 'البركة للحوم', unit: 'kg', costPerUnit: 180, branch: 'فرع المعادي', allergens: [] },
        { id: 'inv-003', name: 'رز بسمتي', category: 'حبوب', stock: 100, reorderLevel: 50, supplier: 'شركة سنابل', unit: 'kg', costPerUnit: 45, branch: 'فرع الزمالك', allergens: [] },
        { id: 'inv-004', name: 'عدس', category: 'حبوب', stock: 80, reorderLevel: 40, supplier: 'شركة سنابل', unit: 'kg', costPerUnit: 35, branch: 'فرع الزمالك', allergens: [] },
        { id: 'inv-005', name: 'بصل', category: 'خضروات', stock: 60, reorderLevel: 30, supplier: 'مزارع فريش', unit: 'kg', costPerUnit: 12, branch: 'فرع المعادي', allergens: [] },
        { id: 'inv-006', name: 'زيت زيتون', category: 'زيوت', stock: 20, reorderLevel: 10, supplier: 'زيوت سينا', unit: 'L', costPerUnit: 250, branch: 'فرع المعادي', allergens: [] },
        { id: 'inv-007', name: 'كانز كوكاكولا', category: 'مشروبات', stock: 200, reorderLevel: 100, supplier: 'شركة بيفيردج', unit: 'unit', costPerUnit: 8, branch: 'فرع الزمالك', allergens: [] },
        { id: 'inv-008', name: 'دقيق', category: 'حبوب', stock: 50, reorderLevel: 20, supplier: 'شركة سنابل', unit: 'kg', costPerUnit: 25, branch: 'فرع الزمالك', allergens: ['Gluten'] },
        { id: 'inv-009', name: 'لبن', category: 'ألبان', stock: 30, reorderLevel: 15, supplier: 'مزارع فريش', unit: 'L', costPerUnit: 30, branch: 'فرع المعادي', allergens: ['Dairy'] },
        { id: 'inv-010', name: 'لوز', category: 'مكسرات', stock: 10, reorderLevel: 5, supplier: 'زيوت سينا', unit: 'kg', costPerUnit: 400, branch: 'فرع الزمالك', allergens: ['Nuts'] },
    ];
    return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generateCustomersData = async (): Promise<Customer[]> => {
    const prompt = "Generate a list of 20 realistic customers for a restaurant loyalty program. Provide a unique ID, a full Egyptian Arabic name, a realistic email, a fake Egyptian phone number, loyalty points (number between 50 and 1000), and a recent last order date string ('YYYY-MM-DD').";
    const schema = {
        type: Type.ARRAY,
        items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            loyaltyPoints: { type: Type.NUMBER },
            lastOrderDate: { type: Type.STRING },
        },
        required: ["id", "name", "email", "phone", "loyaltyPoints", "lastOrderDate"],
        },
    };
    const fallbackData = [
        { id: 'CUST-001', name: 'ياسمين عبد العزيز', email: 'yasmine.a@example.com', phone: '010-1234-5678', loyaltyPoints: 450, lastOrderDate: '2023-10-25' },
        { id: 'CUST-002', name: 'عمرو دياب', email: 'amr.d@example.com', phone: '012-8765-4321', loyaltyPoints: 890, lastOrderDate: '2023-10-27' },
    ];
    return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generatePurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    const prompt = "Generate a list of 15 realistic purchase orders for a restaurant. Provide a unique ID (e.g., PO-12345), supplier name, branch name ('فرع الزمالك' or 'فرع المعادي'), total amount in EGP, status ('Received', 'Pending', 'Ordered'), and a recent date string.";
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                supplier: { type: Type.STRING },
                branch: { type: Type.STRING },
                total: { type: Type.NUMBER },
                status: { type: Type.STRING },
                date: { type: Type.STRING },
            },
            required: ["id", "supplier", "branch", "total", "status", "date"],
        },
    };
    const fallbackData = [
        { id: 'PO-10521', supplier: 'مزارع فريش', branch: 'فرع المعادي', total: 5200, status: 'Received', date: '2023-10-26' },
        { id: 'PO-10522', supplier: 'البركة للحوم', branch: 'فرع الزمالك', total: 12500, status: 'Ordered', date: '2023-10-27' },
    ];
    return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generateAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
    const prompt = `Generate a list of 25 realistic attendance records for restaurant employees for today's date (${new Date().toISOString().slice(0, 10)}). Provide a unique ID, employee's full Egyptian Arabic name, a linked employee ID ('emp-001' to 'emp-015'), branch name ('فرع الزمالك' or 'فرع المعادي'). The records should represent a mix of statuses: 'Present' (on-time check-in), 'Late' (check-in after 9:05 AM), 'Absent' (checkIn and checkOut are null), and 'On Leave' (checkIn and checkOut are null). For 'Present' and 'Late' statuses, provide a realistic check-in time (e.g., '08:55 AM'), a check-out time (e.g., '05:03 PM'), and total duration (e.g., '8h 8m'). For 'Absent' and 'On Leave', checkIn, checkOut, and duration should be null. Occasionally add a short note in colloquial Egyptian Arabic, like 'مشي بدري عنده معاد' or 'شغل من البيت بموافقة'.`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                employeeName: { type: Type.STRING },
                employeeId: { type: Type.STRING },
                branch: { type: Type.STRING },
                date: { type: Type.STRING },
                checkIn: { type: Type.STRING, nullable: true },
                checkOut: { type: Type.STRING, nullable: true },
                duration: { type: Type.STRING, nullable: true },
                status: { type: Type.STRING },
                notes: { type: Type.STRING, nullable: true },
            },
            required: ["id", "employeeName", "employeeId", "branch", "date", "status"],
        },
    };
    const fallbackData = [
        { id: 'ATT-001', employeeName: 'أحمد محمود', employeeId: 'emp-001', branch: 'فرع الزمالك', date: new Date().toISOString().slice(0, 10), checkIn: '08:55 AM', checkOut: '05:03 PM', duration: '8h 8m', status: 'Present' },
        { id: 'ATT-002', employeeName: 'فاطمة علي', employeeId: 'emp-002', branch: 'فرع المعادي', date: new Date().toISOString().slice(0, 10), checkIn: '09:10 AM', checkOut: '05:15 PM', duration: '8h 5m', status: 'Late', notes: 'كانت واقفة في زحمة' },
        { id: 'ATT-003', employeeName: 'محمود الشريف', employeeId: 'emp-005', branch: 'فرع المعادي', date: new Date().toISOString().slice(0, 10), checkIn: null, checkOut: null, duration: null, status: 'Absent' },
        { id: 'ATT-004', employeeName: 'كريم عادل', employeeId: 'emp-003', branch: 'فرع الزمالك', date: new Date().toISOString().slice(0, 10), checkIn: null, checkOut: null, duration: null, status: 'On Leave' },

    ];
    return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generateAttendanceSummary = async (question: string, contextData: AttendanceRecord[]): Promise<string> => {
    const prompt = `You are an expert HR data analyst for an Egyptian company. Based on the following attendance JSON data, answer the user's question concisely in Egyptian Arabic dialect (اللهجة المصرية العامية). Provide actionable insights if possible.
    User Question: "${question}"
    Context Data: ${JSON.stringify(contextData, null, 2)}`;
    
    if (!API_KEY || isApiDisabled) return "تحليلات الذكاء الاصطناعي مش شغالة حاليًا عشان مفتاح الـAPI مش موجود.";
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        return response.text;

    } catch (error: any) {
        console.error("Error generating attendance summary:", error);
        const errorString = JSON.stringify(error).toLowerCase();
        if (errorString.includes('quota') || errorString.includes('resource_exhausted')) {
            console.warn("Quota exceeded. Disabling further Gemini API calls for this session.");
            isApiDisabled = true;
        }
        return "عفوًا، حصل مشكلة واحنا بنحلل البيانات. ممكن تجرب تاني.";
    }
};

export const generateRecipes = async (): Promise<Recipe[]> => {
    const prompt = `Generate a list of 10 realistic menu item recipes for an Egyptian restaurant, with names and instructions in Egyptian Arabic dialect. Some should be final dishes, and some should be 'sub-recipes' (preparations like sauces or spice mixes) by setting 'isSubRecipe' to true.
For each recipe, provide:
- A unique ID, name (in Egyptian Arabic), and category (in Arabic).
- 'isSubRecipe': a boolean.
- 'wastagePercentage': a number from 0 to 5.
- 'instructions': A string with detailed, multi-step preparation instructions in colloquial Egyptian Arabic, formatted with markdown (e.g., '1. نفرم البصل.\\n2. نشوحه...').
- 'productionYield': A number indicating how many units this batch produces (e.g., 10).
- 'yieldUnit': A string describing the yield unit in Arabic (e.g., 'بورشن', 'لتر', 'كيلو').
- An array of ingredients. Each ingredient must have:
  - EITHER an 'inventoryItemId' (from 'inv-001' to 'inv-010') OR a 'subRecipeId' linking to another generated sub-recipe.
  - 'quantity' and 'unit'.
  - 'yieldPercentage': a number from 80 to 100. For liquids or grains, use 100. For vegetables that need peeling/chopping like onions or tomatoes, use a value like 90.
Ensure at least one main dish recipe uses a sub-recipe as an ingredient.`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                isSubRecipe: { type: Type.BOOLEAN },
                wastagePercentage: { type: Type.NUMBER },
                instructions: { type: Type.STRING },
                productionYield: { type: Type.NUMBER },
                yieldUnit: { type: Type.STRING },
                ingredients: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            inventoryItemId: { type: Type.STRING, nullable: true },
                            subRecipeId: { type: Type.STRING, nullable: true },
                            quantity: { type: Type.NUMBER },
                            unit: { type: Type.STRING },
                            yieldPercentage: { type: Type.NUMBER },
                        },
                        required: ["quantity", "unit", "yieldPercentage"]
                    }
                }
            },
            required: ["id", "name", "category", "ingredients", "isSubRecipe", "wastagePercentage", "instructions", "productionYield", "yieldUnit"],
        },
    };
    const fallbackData: Recipe[] = [
        { 
            id: 'rec-sub-01', name: 'صلصة طماطم أساسية', category: 'صوصات', isSubRecipe: true, wastagePercentage: 2,
            instructions: "1. نفرم البصل ناعم.\n2. نشوح البصل في زيت زيتون لحد ما يدبل.\n3. نضيف الطماطم ونسيبها تتسبك 20 دقيقة.\n4. نضربها في الخلاط لحد ما تنعم.",
            productionYield: 1,
            yieldUnit: 'كيلو',
            ingredients: [
                { inventoryItemId: 'inv-001', quantity: 1000, unit: 'g', yieldPercentage: 90 }, 
                { inventoryItemId: 'inv-005', quantity: 200, unit: 'g', yieldPercentage: 85 },
                { inventoryItemId: 'inv-006', quantity: 50, unit: 'ml', yieldPercentage: 100 }
            ] 
        },
        { 
            id: 'rec-001', name: 'كشري أصلي', category: 'طبق رئيسي', isSubRecipe: false, wastagePercentage: 3,
            instructions: "1. نسوي الرز والعدس كل واحد لوحده.\n2. نسلق المكرونة.\n3. نحط طبقات من الرز، العدس، والمكرونة.\n4. نحط فوقهم صلصة الطماطم والبصل المحمر.",
            productionYield: 10,
            yieldUnit: 'بورشن',
            ingredients: [
                { inventoryItemId: 'inv-003', quantity: 1000, unit: 'g', yieldPercentage: 100 }, 
                { inventoryItemId: 'inv-004', quantity: 800, unit: 'g', yieldPercentage: 100 }, 
                { subRecipeId: 'rec-sub-01', quantity: 1, unit: 'unit', yieldPercentage: 100 }
            ] 
        },
        { 
            id: 'rec-002', name: 'طبق فراخ مشوية', category: 'طبق رئيسي', isSubRecipe: false, wastagePercentage: 4,
            instructions: "1. نتبل الفراخ 4 ساعات على الأقل.\n2. نشوي الفراخ على الجريل لحد ما تستوي.\n3. نقدمها مع رز بسمتي.",
            productionYield: 4,
            yieldUnit: 'بورشن',
            ingredients: [
                { inventoryItemId: 'inv-002', quantity: 1000, unit: 'g', yieldPercentage: 100 }, 
                { inventoryItemId: 'inv-003', quantity: 600, unit: 'g', yieldPercentage: 100 },
                { inventoryItemId: 'inv-006', quantity: 80, unit: 'ml', yieldPercentage: 100 }
            ] 
        },
         { 
            id: 'rec-003', name: 'مكرونة بشاميل', category: 'طبق رئيسي', isSubRecipe: false, wastagePercentage: 5,
            instructions: "1. نعمل صوص البشاميل بالدقيق واللبن والزبدة.\n2. نعصج اللحمة المفرومة ونسلق المكرونة.\n3. نرص طبقات المكرونة واللحمة والصوص في صينية.\n4. ندخلها الفرن لحد ما وشها يحمر.",
            productionYield: 8,
            yieldUnit: 'بورشن',
            ingredients: [
                { inventoryItemId: 'inv-008', quantity: 100, unit: 'g', yieldPercentage: 100 }, 
                { inventoryItemId: 'inv-009', quantity: 1000, unit: 'ml', yieldPercentage: 100 },
            ] 
        },
    ];
    return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generateKitchenOrders = async (): Promise<KitchenOrder[]> => {
    const prompt = "Generate a list of 10 realistic central kitchen prep orders. Provide a unique ID, the destination branch name (e.g., 'فرع المعادي'), a summary of items in Arabic (e.g., '5 كيلو تتبيلة فراخ، 10 لتر صلصة طماطم'), status ('Completed', 'In Progress', 'Pending'), and an estimated prep time string (e.g., '45 دقيقة').";
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                destinationBranch: { type: Type.STRING },
                items: { type: Type.STRING },
                status: { type: Type.STRING },
                prepTime: { type: Type.STRING },
            },
            required: ["id", "destinationBranch", "items", "status", "prepTime"],
        },
    };
    const fallbackData = [
        { id: 'CK-ORD-001', destinationBranch: 'فرع المعادي', items: '5 كيلو تتبيلة فراخ، 10 لتر صلصة طماطم', status: 'In Progress', prepTime: '45 دقيقة' },
        { id: 'CK-ORD-002', destinationBranch: 'فرع الزمالك', items: '200 قطعة عيش برجر، 15 كيلو لحم مفروم', status: 'Pending', prepTime: 'ساعتين' },
    ];
    return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generateDeliveryZones = async (): Promise<DeliveryZone[]> => {
    const prompt = "Generate a list of 8 realistic delivery zones for a restaurant in Cairo. Provide a unique ID, a zone name in Arabic (e.g., 'الزمالك', 'المعادي دجلة'), a delivery fee in EGP, a number of active drivers, and an average delivery time string (e.g., '35 دقيقة').";
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                deliveryFee: { type: Type.NUMBER },
                activeDrivers: { type: Type.NUMBER },
                avgTime: { type: Type.STRING },
            },
            required: ["id", "name", "deliveryFee", "activeDrivers", "avgTime"],
        },
    };
    const fallbackData = [
        { id: 'ZONE-01', name: 'الزمالك', deliveryFee: 25, activeDrivers: 5, avgTime: '35 دقيقة' },
        { id: 'ZONE-02', name: 'المعادي دجلة', deliveryFee: 20, activeDrivers: 7, avgTime: '30 دقيقة' },
    ];
    return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generateBranchesData = async (): Promise<Branch[]> => {
    const prompt = "Generate a list of 5 realistic branches for a restaurant chain. Provide a unique ID, a branch name in Arabic (e.g., 'فرع المعادي'), the manager's full Arabic name, the number of employees, and a realistic daily sales figure in EGP.";
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                manager: { type: Type.STRING },
                employeeCount: { type: Type.NUMBER },
                dailySales: { type: Type.NUMBER },
            },
            required: ["id", "name", "manager", "employeeCount", "dailySales"],
        },
    };
    const fallbackData = [
        { id: 'BR-01', name: 'فرع المعادي', manager: 'سلمى أحمد', employeeCount: 15, dailySales: 28500 },
        { id: 'BR-02', name: 'فرع الزمالك', manager: 'حسن علي', employeeCount: 22, dailySales: 41200 },
    ];
    return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generatePnlData = async (branchName?: string, dateRange?: string): Promise<PnlEntry[]> => {
    const branchContext = branchName ? `for the '${branchName}' branch` : `for the entire business`;
    const prompt = `Generate a detailed, hierarchical Profit & Loss statement in colloquial Egyptian Arabic ${branchContext} for the current fiscal period.
    - Create a nested structure. 'الإيرادات' and 'تكلفة البضاعة' should have sub-accounts. 'المصاريف التشغيلية' must have at least 'مرتبات وأجور', 'إيجار وكهربا', and 'تسويق' as sub-accounts.
    - For each entry (including sub-accounts), provide a unique ID, a category (in English e.g., 'Revenue'), a title (in colloquial Egyptian Arabic), a current amount, a previousAmount (for comparison), and a budgetAmount. Make the numbers realistic for a restaurant.
    - For some entries, add a 'dataSource' ('pos', 'inventory', 'hr', 'manual') and a short 'notes' string in English.
    - Calculate and include entries for 'مجمل الربح' and 'صافي الربح', and mark them with 'isTotal: true'.
    - The amounts for expenses and COGS should be negative numbers.`;

    const pnlEntrySchema: any = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING },
            title: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            previousAmount: { type: Type.NUMBER, nullable: true },
            budgetAmount: { type: Type.NUMBER, nullable: true },
            isTotal: { type: Type.BOOLEAN, nullable: true },
            dataSource: { type: Type.STRING, nullable: true },
            notes: { type: Type.STRING, nullable: true },
        },
        required: ["id", "category", "title", "amount"],
    };
    // FIX: Define recursion correctly to avoid stack overflow.
    pnlEntrySchema.properties.subRows = { 
        type: Type.ARRAY, 
        items: pnlEntrySchema 
    };
    
    const schema = { type: Type.ARRAY, items: pnlEntrySchema };
    
    const fallbackData: PnlEntry[] = [
      { id: 'rev-total', category: 'Revenue', title: 'كل الإيرادات', amount: 750000, previousAmount: 720000, budgetAmount: 740000, isTotal: true, subRows: [
        { id: 'rev-food', category: 'Revenue', title: 'فلوس الأكل', amount: 600000, previousAmount: 580000, budgetAmount: 590000, dataSource: 'pos', notes: 'Strong performance in main courses' },
        { id: 'rev-bev', category: 'Revenue', title: 'فلوس المشروبات', amount: 150000, previousAmount: 140000, budgetAmount: 150000, dataSource: 'pos' },
      ]},
      { id: 'cogs-total', category: 'COGS', title: 'تكلفة البضاعة', amount: -225000, previousAmount: -218000, budgetAmount: -220000, isTotal: true, subRows: [
        { id: 'cogs-food', category: 'COGS', title: 'تكلفة خامات الأكل', amount: -180000, previousAmount: -175000, budgetAmount: -176000, dataSource: 'inventory' },
        { id: 'cogs-bev', category: 'COGS', title: 'تكلفة خامات المشروبات', amount: -45000, previousAmount: -43000, budgetAmount: -44000, dataSource: 'inventory', notes: 'Slight increase in coffee bean prices' },
      ]},
      { id: 'gp', category: 'Gross Profit', title: 'مجمل الربح', amount: 525000, previousAmount: 502000, budgetAmount: 520000, isTotal: true },
      { id: 'opex-total', category: 'Operating Expenses', title: 'المصاريف التشغيلية', amount: -265000, previousAmount: -260000, budgetAmount: -270000, isTotal: true, subRows: [
        { id: 'opex-salary', category: 'Operating Expenses', title: 'المرتبات والأجور', amount: -150000, previousAmount: -150000, budgetAmount: -155000, dataSource: 'hr' },
        { id: 'opex-rent', category: 'Operating Expenses', title: 'الإيجار والكهربا والمياه', amount: -80000, previousAmount: -80000, budgetAmount: -80000, dataSource: 'manual' },
        { id: 'opex-marketing', category: 'Operating Expenses', title: 'التسويق', amount: -35000, previousAmount: -30000, budgetAmount: -35000, dataSource: 'manual', notes: 'New social media campaign launched' },
      ]},
      { id: 'np', category: 'Net Profit', title: 'صافي الربح', amount: 260000, previousAmount: 242000, budgetAmount: 250000, isTotal: true },
    ];
    return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generatePnlInsights = async (pnlData: PnlEntry[]): Promise<string> => {
    const prompt = `You are a financial analyst for a restaurant. Analyze the following P&L data and provide a concise summary in colloquial Egyptian Arabic with 2-3 actionable bullet points. Data: ${JSON.stringify(pnlData)}`;
    
    if (!API_KEY || isApiDisabled) return "تحليل الذكاء الاصطناعي مش شغال حاليًا.";
    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        return response.text;
    } catch (error: any) {
        console.error("Error generating P&L insights:", error);
        const errorString = JSON.stringify(error).toLowerCase();
        if (errorString.includes('quota') || errorString.includes('resource_exhausted')) {
            console.warn("Quota exceeded. Disabling further Gemini API calls for this session.");
            isApiDisabled = true;
        }
        return "عفوًا، حصل مشكلة واحنا بنحلل البيانات.";
    }
};

export const generateWhatIfPnl = async (basePnl: PnlEntry[], scenario: string): Promise<PnlEntry[]> => {
    const prompt = `You are a financial modeling AI. Given the following P&L JSON data (with Arabic titles), apply the user's scenario and return a new P&L JSON in the exact same structure with the calculated changes. Only modify the affected numbers and recalculate totals ('مجمل الربح', 'صافي الربح', and other isTotal rows). Keep IDs and other metadata the same.
    User Scenario: "${scenario}"
    Base P&L Data: ${JSON.stringify(basePnl)}`;

    const pnlEntrySchema: any = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING },
            title: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            previousAmount: { type: Type.NUMBER, nullable: true },
            budgetAmount: { type: Type.NUMBER, nullable: true },
            isTotal: { type: Type.BOOLEAN, nullable: true },
            dataSource: { type: Type.STRING, nullable: true },
            notes: { type: Type.STRING, nullable: true },
        },
        required: ["id", "category", "title", "amount"],
    };
    // FIX: Define recursion correctly to avoid stack overflow.
    pnlEntrySchema.properties.subRows = { 
        type: Type.ARRAY, 
        items: pnlEntrySchema
    };
    const schema = { type: Type.ARRAY, items: pnlEntrySchema };

    return generateContentWithFallback(prompt, schema, basePnl); // Fallback to original data on error
}


export const generateReportsList = async (): Promise<Report[]> => {
    const prompt = "Generate a list of 8 essential reports for a restaurant management system. For each, provide a unique ID, a descriptive name in Arabic, a short description in Arabic, and a last generated date string (e.g., '2023-10-27 09:00 AM').";
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                lastGenerated: { type: Type.STRING },
            },
            required: ["id", "name", "description", "lastGenerated"],
        },
    };
    const fallbackData = [
        { id: 'REP-01', name: 'ملخص المبيعات اليومي', description: 'ملخص لكل حركات البيع في يوم معين.', lastGenerated: '2023-10-27 09:00 AM' },
        { id: 'REP-02', name: 'تقرير أرصدة المخزون', description: 'الأرصدة الحالية لكل أصناف المخزن.', lastGenerated: '2023-10-27 08:30 AM' },
    ];
    return generateContentWithFallback(prompt, schema, fallbackData);
};

export const generateReportSummary = async (reportName: string, reportData?: any): Promise<string> => {
    const prompt = `You are a data analyst. Below is the data for a report named "${reportName}". Analyze the data and provide a concise, insightful summary in 2-3 bullet points in colloquial Egyptian Arabic. Focus on the most important trends, totals, or anomalies. Report data: ${JSON.stringify(reportData, null, 2)}`;
    
    const fallbackSummary = `
        - إجمالي المبيعات متركز أكتر في فرع المعادي، وعامل 65% من الإجمالي.
        - فيه انخفاض في مبيعات قسم "الحلويات" بنسبة 20% عن الشهر اللي فات.
        - الزبون "أحمد المصري" هو أكتر واحد صرف الشهر ده بإجمالي أوردرات 5,200 جنيه.
        `;

    if (!API_KEY || isApiDisabled) return fallbackSummary;
    try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // simulate network delay
        
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        return response.text;

    } catch (error: any) {
        console.error("Error generating report summary with Gemini:", error);
        const errorString = JSON.stringify(error).toLowerCase();
        if (errorString.includes('quota') || errorString.includes('resource_exhausted')) {
            console.warn("Quota exceeded. Disabling further Gemini API calls for this session.");
            isApiDisabled = true;
        }
        return fallbackSummary;
    }
};

export const generatePredictiveAnalysis = async (prompt: string, contextData?: any): Promise<string> => {
     const fullPrompt = `You are a business intelligence expert for a restaurant chain. Based on historical data, provide a predictive analysis in colloquial Egyptian Arabic for the following user request. Be optimistic but realistic, and provide your answer in a concise paragraph followed by 2-3 bullet points with specific numbers.
     User Request: "${prompt}"
     Historical Data Context: ${JSON.stringify(contextData, null, 2)}`;
    
    const fallbackPrediction = `
        بناءً على تحليل بيانات النمو الحالية والموسمية، متوقع إن الشهر الجاي يشهد زيادة ملحوظة في المبيعات.
        - **إجمالي المبيعات المتوقعة:** من 850,000 إلى 920,000 جنيه.
        - **متوسط النمو:** زيادة بنسبة 15-20% عن الشهر ده.
        - **أعلى الفروع أداءً:** متوقع فرع الزمالك يفضل هو الأعلى في المبيعات.
        `;

    if (!API_KEY || isApiDisabled) return fallbackPrediction;
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
         const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: fullPrompt,
        });
        return response.text;
    } catch (error: any) {
        console.error("Error generating predictive analysis:", error);
        const errorString = JSON.stringify(error).toLowerCase();
        if (errorString.includes('quota') || errorString.includes('resource_exhausted')) {
            console.warn("Quota exceeded. Disabling further Gemini API calls for this session.");
            isApiDisabled = true;
        }
         return fallbackPrediction;
    }
};

export const interpretAiCommand = async (command: string): Promise<any> => {
    const prompt = `You are the AI engine for a business management system. Your task is to interpret a user's natural language command (could be in English or colloquial Egyptian Arabic) and translate it into a structured JSON object. The system has the following views: 'dashboard', 'pos', 'sales', 'inventory', 'hr', 'attendance', 'reports'.

    Based on the user command, determine the target 'view' and any applicable 'filters'.

    - For 'attendance', possible filters are 'status' (with values 'Late', 'Absent', 'Present', 'On Leave') and 'branch'.
    - For 'inventory', a possible filter is 'status' (with value 'low_stock').
    - For other views, you can just navigate.

    User command: "${command}"

    Return ONLY the JSON object. Examples:
    - Command: "show me who was late today" -> {"view": "attendance", "filters": {"status": "Late"}}
    - Command: "مين اتأخر النهاردة؟" -> {"view": "attendance", "filters": {"status": "Late"}}
    - Command: "افتح شاشة المبيعات" -> {"view": "sales", "filters": {}}
    - Command: "what items are running low" -> {"view": "inventory", "filters": {"status": "low_stock"}}
    - Command: "إيه النواقص اللي في المخزن" -> {"view": "inventory", "filters": {"status": "low_stock"}}
    - Command: "take me home" -> {"view": "dashboard", "filters": {}}
    - Command: "وديني على الرئيسية" -> {"view": "dashboard", "filters": {}}
    - If the command is unclear, return: {"error": "Unrecognized command"}
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            view: { type: Type.STRING },
            filters: { type: Type.OBJECT },
            error: { type: Type.STRING },
        }
    };
    
    if (!API_KEY || isApiDisabled) return {error: "AI is disabled"};
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error: any) {
        console.error("Error interpreting AI command:", error);
        const errorString = JSON.stringify(error).toLowerCase();
        if (errorString.includes('quota') || errorString.includes('resource_exhausted')) {
            console.warn("Quota exceeded. Disabling further Gemini API calls for this session.");
            isApiDisabled = true;
        }
        return { error: "Unrecognized command" };
    }
};

// --- MOCK DATA FOR DASHBOARD HUBS (Not using Gemini to keep them fast) ---

export const generateSalesDashboardData = async (): Promise<SalesDashboardData> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        totalRevenue: 785430.50,
        unpaidInvoices: 12,
        overdueAmount: 45210.00,
        invoiceStatusCounts: { 'Paid': 152, 'Sent': 10, 'Overdue': 2, 'Draft': 5 }
    };
};
export const generateRecentInvoices = async (): Promise<Invoice[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
         { id: 'INV-1024', customerName: 'شركة النيل', total: 15200, status: 'Paid', issueDate: '2023-10-28', dueDate: '2023-11-28', branch: 'فرع الزمالك', items:[], subtotal:0, discount:0, tax:0 },
         { id: 'INV-1023', customerName: 'مؤسسة الأهرام', total: 8500, status: 'Sent', issueDate: '2023-10-27', dueDate: '2023-11-27', branch: 'فرع المعادي', items:[], subtotal:0, discount:0, tax:0 },
         { id: 'INV-1022', customerName: 'فندق ماريوت', total: 22300, status: 'Overdue', issueDate: '2023-09-15', dueDate: '2023-10-15', branch: 'فرع الزمالك', items:[], subtotal:0, discount:0, tax:0 },
    ];
}


export const generateHRDashboardData = async (): Promise<HRDashboardKPIs> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { headcount: 85, turnoverRate: 4.5, attendanceRate: 96.2, pendingLeaveRequests: 3 };
};
export const generateNewHiresAndBirthdays = async (): Promise<{newHires: Employee[], birthdays: Employee[]}> => {
    await new Promise(resolve => setTimeout(resolve, 500));
     const newHires = [
        { id: 'emp-086', name: 'علي فتحي', position: 'ويتر', branch: 'فرع المعادي' },
        { id: 'emp-087', name: 'نورهان السيد', position: 'مضيفة', branch: 'فرع الزمالك' },
    ] as Employee[];
     const birthdays = [
        { id: 'emp-021', name: 'محمد إبراهيم', position: 'شيف', branch: 'فرع المعادي' },
    ] as Employee[];
    return { newHires, birthdays };
}

export const generateLowStockItemsData = async (): Promise<InventoryItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { id: 'INV-003', name: 'رز بسمتي (كيلو)', category: 'حبوب', stock: 12, reorderLevel: 15, supplier: 'شركة سنابل', unit: 'kg', costPerUnit: 45, branch: 'فرع الزمالك' },
        { id: 'INV-015', name: 'عدس (كيلو)', category: 'حبوب', stock: 8, reorderLevel: 10, supplier: 'شركة سنابل', unit: 'kg', costPerUnit: 35, branch: 'فرع الزمالك' },
        { id: 'INV-021', name: 'مناديل ورق (بكرة)', category: 'مستهلكات', stock: 25, reorderLevel: 50, supplier: 'كلين كو', unit: 'unit', costPerUnit: 3, branch: 'فرع المعادي' },
    ];
};

export const generateRolesAndPermissions = async (): Promise<Role[]> => {
    const fullPermissions: Permissions = {
        dashboard: ['view', 'create', 'edit', 'delete'], pos: ['view', 'create', 'edit', 'delete'],
        sales: ['view', 'create', 'edit', 'delete'], purchases: ['view', 'create', 'edit', 'delete'],
        inventory: ['view', 'create', 'edit', 'delete'], customers: ['view', 'create', 'edit', 'delete'],
        hr: ['view', 'create', 'edit', 'delete'], attendance: ['view', 'create', 'edit', 'delete'],
        menu: ['view', 'create', 'edit', 'delete'], recipes: ['view', 'create', 'edit', 'delete'],
        kitchen: ['view', 'create', 'edit', 'delete'], delivery: ['view', 'create', 'edit', 'delete'],
        branches: ['view', 'create', 'edit', 'delete'], daily_ops: ['view', 'create', 'edit', 'delete'],
        pnl: ['view', 'create', 'edit', 'delete'], reports: ['view', 'create', 'edit', 'delete'],
        settings: ['view', 'create', 'edit', 'delete'],
    };
    
    const roles: Role[] = [
        {
            id: 'role-admin',
            name: 'Admin',
            permissions: fullPermissions
        },
        {
            id: 'role-manager',
            name: 'Manager',
            permissions: fullPermissions // Granting full permissions to manager as well
        },
        {
            id: 'role-employee',
            name: 'Employee',
            permissions: {}
        },
    ];
    return roles;
};

export const generateUsers = async (): Promise<User[]> => {
    return [
        { id: 'user-01', name: 'Admin User', email: 'admin@system.com', roleId: 'role-admin', userType: 'admin' },
        { id: 'user-02', name: 'Manager User', email: 'manager@system.com', roleId: 'role-manager', userType: 'admin' },
        { id: 'user-03', name: 'أحمد محمود', email: 'ahmed.mahmoud@example.com', roleId: 'role-employee', userType: 'employee', employeeId: 'emp-001' },
        { id: 'user-04', name: 'فاطمة علي', email: 'fatma.ali@example.com', roleId: 'role-employee', userType: 'employee', employeeId: 'emp-002' },
    ];
}

export const generateLeaveRequests = async (): Promise<LeaveRequest[]> => {
    return [
        { id: 'lr-001', employeeId: 'emp-001', employeeName: 'أحمد محمود', leaveType: 'Annual', startDate: '2024-08-10', endDate: '2024-08-15', reason: 'أجازة عائلية', status: 'Approved', requestDate: '2024-07-20' },
        { id: 'lr-002', employeeId: 'emp-002', employeeName: 'فاطمة علي', leaveType: 'Sick', startDate: '2024-07-22', endDate: '2024-07-23', reason: 'نزلة برد', status: 'Approved', requestDate: '2024-07-22' },
        { id: 'lr-003', employeeId: 'emp-004', employeeName: 'سارة مصطفى', leaveType: 'Annual', startDate: '2024-09-01', endDate: '2024-09-05', reason: 'ظروف شخصية', status: 'Pending', requestDate: '2024-07-28' },
    ];
};
