import Dexie, { type Table } from 'dexie';
import type { AppSettings, Product, Sale, SaleItem } from '../types/pos';

export const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  shopName: 'Lumina Cosmetics',
  currency: 'IQD',
  receiptWidth: '80mm',
  receiptFooter: 'THANK YOU FOR VISITING!',
  autoPrint: true,
  receiptLanguage: 'bilingual',
  appLanguage: 'en',
};

export class CosmeticsPosDatabase extends Dexie {
  products!: Table<Product, number>;
  sales!: Table<Sale, number>;
  saleItems!: Table<SaleItem, number>;
  settings!: Table<AppSettings, number>;

  constructor() {
    super('CosmeticsShopPosDB');

    this.version(1).stores({
      products: '++id, &barcode, name, category, updatedAt',
      sales: '++id, &receiptNumber, saleDate',
      saleItems: '++id, saleId, productId',
      settings: 'id',
    });
  }
}

export const db = new CosmeticsPosDatabase();

export async function ensureDefaultSettings(): Promise<AppSettings> {
  const existing = await db.settings.get(1);
  if (existing) {
    if (!existing.appLanguage) {
      const migrated: AppSettings = { ...DEFAULT_SETTINGS, ...existing };
      await db.settings.put(migrated);
      return migrated;
    }
    return existing;
  }
  await db.settings.put(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}
