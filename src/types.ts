// Types d'énumération du schéma Prisma
export type SaleType = 'RETAIL' | 'WHOLESALE' | 'CREDIT' | 'CASH';
export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL';
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'OTHER';
export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';
export type UserStatus = 'ACTIVE' | 'DISABLED';
export type BusinessType = 'SHOP' | 'RESTAURANT' | 'PHARMACY' | 'SERVICE' | 'OTHER';

// Nouveaux types pour les notifications
export type NotificationType = 'LOW_STOCK' | 'SALES_TARGET' | 'EXPENSE_ALERT' | 'NEW_SALE' | 'NEW_EXPENSE';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Interface pour les paramètres de notification
interface NotificationSettings {
  lowStockThreshold?: number;
  salesTarget?: number;
  expenseAlertThreshold?: number;
  enableLowStockAlerts?: boolean;
  enableSalesTargetAlerts?: boolean;
  enableExpenseAlerts?: boolean;
}

// Interface pour les paramètres d'intégration
interface IntegrationSettings {
  accounting?: string;
  payment?: string;
}

// Interface pour les paramètres d'entreprise
interface BusinessSettings {
  taxRate?: number;
  invoicePrefix?: string;
  lowStockThreshold?: number;
  currencySymbol?: string;
  timezone?: string;
  notifications?: NotificationSettings;
  integrations?: IntegrationSettings;
}

export interface Sale {
  id: string;
  reference: string;
  date: string;
  clientId?: string | null;
  clientName?: string | null;
  productId?: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  profit: number;
  saleType: SaleType;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  businessId: string;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Expense {
  id: string;
  reference?: string | null;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  receiptUrl?: string | null;
  approvedById?: string | null;
  businessId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  sku?: string | null;
  barcode?: string | null;
  stock: number;
  minStock: number;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  purchasePrice: number;
  images?: any | null;
  supplierId?: string | null;
  businessId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  telephone?: string | null;
  balance: number;
  email?: string | null;
  address?: string | null;
  company?: string | null;
  notes?: string | null;
  loyaltyPoints: number;
  lastPurchaseDate?: string | null;
  businessId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  product: string;
  contacts?: string | null;
  email?: string | null;
  telephone?: string | null;
  address?: string | null;
  description?: string | null;
  productTypes?: string | null;
  rating?: number | null;
  notes?: string | null;
  businessId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  currency?: string | null;
  taxRate?: number | null;
  timezone?: string | null;
  language?: string | null;
  dateFormat?: string | null;
  settings?: BusinessSettings; // Ajout de la propriété settings
  products?: Product[];
  sales?: Sale[];
  expenses?: Expense[];
  clients?: Client[];
  suppliers?: Supplier[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string | null;
  role: UserRole;
  status?: UserStatus | null;
  avatarUrl?: string | null;
  lastLogin?: string | null;
  permissions?: any | null;
  managedBusinessIds?: string[];
  phone?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  details?: any | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  businessId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedEntityId?: string | null;
}

// Session token payload
export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
}

// Add result types for our actions
export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };