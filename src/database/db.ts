import Dexie, { type Table } from 'dexie';
import type { AppSettings, Expense, Product, Sale, SaleItem, StaffProfile } from '../types/pos';

export const DEFAULT_STAFF_PROFILES: StaffProfile[] = [
  { id: '1', name: 'Cashier 1' },
  { id: '2', name: 'Cashier 2' },
  { id: '3', name: 'Cashier 3' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  shopName: 'Lumina Cosmetics',
  currency: 'IQD',
  receiptWidth: '80mm',
  receiptFooter: 'THANK YOU FOR VISITING!',
  autoPrint: true,
  receiptLanguage: 'bilingual',
  appLanguage: 'en',
  staffProfiles: DEFAULT_STAFF_PROFILES,
};

export class CosmeticsPosDatabase extends Dexie {
  products!: Table<Product, number>;
  sales!: Table<Sale, number>;
  saleItems!: Table<SaleItem, number>;
  expenses!: Table<Expense, number>;
  settings!: Table<AppSettings, number>;

  constructor() {
    super('CosmeticsShopPosDB');

    this.version(1).stores({
      products: '++id, &barcode, name, category, updatedAt',
      sales: '++id, &receiptNumber, saleDate',
      saleItems: '++id, saleId, productId',
      settings: 'id',
    });

    this.version(2).stores({
      products: '++id, &barcode, name, category, updatedAt',
      sales: '++id, &receiptNumber, saleDate, staffId',
      saleItems: '++id, saleId, productId',
      expenses: '++id, date, category',
      settings: 'id',
    });
  }
}

export const db = new CosmeticsPosDatabase();

export async function ensureDefaultSettings(): Promise<AppSettings> {
  const existing = await db.settings.get(1);
  if (existing) {
    const needsMigration =
      !existing.appLanguage ||
      !Array.isArray(existing.staffProfiles) ||
      existing.staffProfiles.length !== 3;
    if (needsMigration) {
      const migrated: AppSettings = {
        ...DEFAULT_SETTINGS,
        ...existing,
        staffProfiles:
          Array.isArray(existing.staffProfiles) && existing.staffProfiles.length === 3
            ? existing.staffProfiles
            : DEFAULT_STAFF_PROFILES,
      };
      await db.settings.put(migrated);
      return migrated;
    }
    return existing;
  }
  await db.settings.put(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}
