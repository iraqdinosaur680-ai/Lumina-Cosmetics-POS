export type AppLanguage = 'en' | 'ar';

export type ReceiptWidth = '58mm' | '80mm';

export type ReceiptLanguage = 'en' | 'ar' | 'bilingual';

export type DateFilterPreset = 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom';

export interface StaffProfile {
  id: '1' | '2' | '3';
  name: string;
}

export interface Product {
  id?: number;
  name: string;
  barcode: string;
  price: number;
  buyingPrice?: number;
  stock?: number;
  reorderPoint?: number;
  category: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id?: number;
  receiptNumber: string;
  subtotalAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  totalCost?: number;
  staffId?: string;
  staffNameSnapshot?: string;
  saleDate: string;
}

export interface SaleItem {
  id?: number;
  saleId: number;
  productId?: number;
  productNameSnapshot: string;
  barcodeSnapshot: string;
  unitPriceSnapshot: number;
  buyingPriceSnapshot?: number;
  quantity: number;
  subtotal: number;
}

export interface Expense {
  id?: number;
  title: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
  staffId?: string;
  staffNameSnapshot?: string;
  createdAt: string;
}

export interface AppSettings {
  id: number;
  shopName: string;
  currency: string;
  receiptWidth: ReceiptWidth;
  receiptFooter: string;
  autoPrint: boolean;
  receiptLanguage: ReceiptLanguage;
  appLanguage: AppLanguage;
  staffProfiles: StaffProfile[];
}

export interface CartItem {
  productId?: number;
  name: string;
  barcode: string;
  unitPrice: number;
  buyingPrice?: number;
  quantity: number;
  subtotal: number;
  image?: string;
}

export interface SaleWithItems {
  sale: Sale;
  items: SaleItem[];
}

export interface ReceiptData {
  receiptNumber: string;
  saleDate: string;
  subtotalAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  items: Array<{
    productName: string;
    barcode: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
  settings: AppSettings;
}

export interface DatabaseBackup {
  version: number;
  exportedAt: string;
  app: string;
  data: {
    products: Product[];
    sales: Sale[];
    saleItems: SaleItem[];
    expenses?: Expense[];
    settings: AppSettings[];
  };
}
