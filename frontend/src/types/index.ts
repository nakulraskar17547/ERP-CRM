export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';

export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export type MovementType = 'IN' | 'OUT';

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerName: string;
  mobileNumber: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  productName: string;
  SKU: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockAlert: number;
  warehouseLocation: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: {
    id: string;
    productName: string;
    SKU: string;
    currentStock: number;
  };
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdById: string;
  createdBy?: {
    id: string;
    fullName: string;
    role: Role;
  };
  timestamp: string;
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: {
    id: string;
    customerName: string;
    businessName: string;
    mobileNumber: string;
    address?: string;
    email?: string | null;
  };
  totalQuantity: number;
  totalAmount: number;
  status: ChallanStatus;
  createdById: string;
  createdBy?: {
    id: string;
    fullName: string;
    role: Role;
  };
  items?: ChallanItem[];
  createdAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  lowStockProducts: Product[];
  recentChallans: Challan[];
}

export interface ApiResponseData<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ field?: string; message: string }>;
}
