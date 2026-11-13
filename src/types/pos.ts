export type AppLanguage = 'en' | 'ar';

export type ReceiptWidth = '58mm' | '80mm';

export type ReceiptLanguage = 'en' | 'ar' | 'bilingual';

export type DateFilterPreset = 'today' | 'yesterday' | 'week' | 'all' | 'custom';

export interface Product {
  id?: number;
  name: string;
  barcode: string;
  price: number;
  category: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id?: number;
  receiptNumber: string;
  totalAmount: number;
  saleDate: string;
}

export interface SaleItem {
  id?: number;
  saleId: number;
  productId?: number;
  productNameSnapshot: string;
  barcodeSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  subtotal: number;
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
}

export interface CartItem {
  productId?: number;
  name: string;
  barcode: string;
  unitPrice: number;
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
    settings: AppSettings[];
  };
}
