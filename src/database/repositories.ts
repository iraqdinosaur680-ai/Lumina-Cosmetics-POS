import { db, DEFAULT_SETTINGS, ensureDefaultSettings } from './db';
import type {
  AppSettings,
  CartItem,
  DatabaseBackup,
  Product,
  Sale,
  SaleItem,
  SaleWithItems,
} from '../types/pos';
import { formatReceiptNumber } from '../services/barcodeService';

export const productRepo = {
  async getAll(): Promise<Product[]> {
    return db.products.orderBy('updatedAt').reverse().toArray();
  },

  async getById(id: number): Promise<Product | undefined> {
    return db.products.get(id);
  },

  async getByBarcode(barcode: string): Promise<Product | undefined> {
    return db.products.where('barcode').equals(barcode).first();
  },

  async search(query: string, category?: string): Promise<Product[]> {
    const q = query.trim().toLowerCase();
    const all = await db.products.orderBy('name').toArray();
    return all.filter((item) => {
      const matchesCat = !category || category === 'All' || item.category === category;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.barcode.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  },

  async create(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const cleanBarcode = input.barcode.trim();
    if (!cleanBarcode) {
      throw new Error('Barcode is required.');
    }
    const existing = await this.getByBarcode(cleanBarcode);
    if (existing) {
      throw new Error(`A product with barcode "${cleanBarcode}" already exists (${existing.name}).`);
    }

    const now = new Date().toISOString();
    const product: Omit<Product, 'id'> = {
      name: input.name.trim(),
      barcode: cleanBarcode,
      price: Math.max(0, Math.round(input.price)),
      category: input.category.trim() || 'Other',
      image: input.image,
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.products.add(product);
    return { ...product, id };
  },

  async update(
    id: number,
    updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Product> {
    const current = await db.products.get(id);
    if (!current) {
      throw new Error('Product not found.');
    }

    const nextBarcode = updates.barcode !== undefined ? updates.barcode.trim() : current.barcode;
    if (!nextBarcode) {
      throw new Error('Barcode cannot be empty.');
    }
    if (nextBarcode !== current.barcode) {
      const conflict = await this.getByBarcode(nextBarcode);
      if (conflict && conflict.id !== id) {
        throw new Error(`Barcode "${nextBarcode}" is already assigned to "${conflict.name}".`);
      }
    }

    const updated: Product = {
      ...current,
      name: updates.name !== undefined ? updates.name.trim() : current.name,
      barcode: nextBarcode,
      price: updates.price !== undefined ? Math.max(0, Math.round(updates.price)) : current.price,
      category: updates.category !== undefined ? updates.category.trim() || 'Other' : current.category,
      image: updates.image !== undefined ? updates.image : current.image,
      updatedAt: new Date().toISOString(),
    };

    await db.products.put(updated);
    return updated;
  },

  async remove(id: number): Promise<void> {
    await db.products.delete(id);
  },

  async seedSampleCatalog(): Promise<number> {
    const samples: Array<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>> = [
      { name: 'Velvet Matte Lipstick - Rose Noir', barcode: '6281001100014', price: 18000, category: 'Makeup' },
      { name: 'Hyaluronic Hydrating Serum 30ml', barcode: '6281001100021', price: 28000, category: 'Skincare' },
      { name: 'Botanical Rosewater Mist 150ml', barcode: '6281001100038', price: 15000, category: 'Skincare' },
      { name: 'Oud & Amber Eau de Parfum 50ml', barcode: '6281001100045', price: 65000, category: 'Fragrance' },
      { name: 'Silk Lash Volume Mascara', barcode: '6281001100052', price: 14500, category: 'Makeup' },
      { name: 'Argan Repair Hair Elixir 100ml', barcode: '6281001100069', price: 22000, category: 'Haircare' },
      { name: 'Shea & Vanilla Body Butter 200g', barcode: '6281001100076', price: 19500, category: 'Body Care' },
      { name: 'سيروم فيتامين سي للوجه', barcode: '6281001100083', price: 24000, category: 'Skincare' },
    ];

    let added = 0;
    await db.transaction('rw', db.products, async () => {
      const now = new Date().toISOString();
      for (const sample of samples) {
        const exists = await db.products.where('barcode').equals(sample.barcode).first();
        if (!exists) {
          await db.products.add({ ...sample, createdAt: now, updatedAt: now });
          added += 1;
        }
      }
    });
    return added;
  },
};

export const salesRepo = {
  /**
   * Persist completed sale and immutable item snapshots inside an atomic IndexedDB transaction.
   */
  async createSaleTransaction(cartItems: CartItem[]): Promise<SaleWithItems> {
    if (cartItems.length === 0) {
      throw new Error('Cannot checkout an empty cart.');
    }

    return db.transaction('rw', db.sales, db.saleItems, async () => {
      const lastSale = await db.sales.orderBy('id').last();
      let nextSeq = 1;
      if (lastSale) {
        const parsed = parseInt(lastSale.receiptNumber, 10);
        if (!Number.isNaN(parsed)) {
          nextSeq = Math.max(parsed + 1, (lastSale.id ?? 0) + 1);
        } else if (lastSale.id) {
          nextSeq = lastSale.id + 1;
        }
      }

      let receiptNumber = formatReceiptNumber(nextSeq);
      while (await db.sales.where('receiptNumber').equals(receiptNumber).first()) {
        nextSeq += 1;
        receiptNumber = formatReceiptNumber(nextSeq);
      }

      const saleDate = new Date().toISOString();
      const totalAmount = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

      const saleRecord: Omit<Sale, 'id'> = {
        receiptNumber,
        totalAmount: Math.round(totalAmount),
        saleDate,
      };

      const saleId = await db.sales.add(saleRecord);

      const itemRecords: SaleItem[] = [];
      for (const item of cartItems) {
        const subtotal = Math.round(item.unitPrice * item.quantity);
        const record: Omit<SaleItem, 'id'> = {
          saleId,
          productId: item.productId,
          productNameSnapshot: item.name,
          barcodeSnapshot: item.barcode,
          unitPriceSnapshot: Math.round(item.unitPrice),
          quantity: item.quantity,
          subtotal,
        };
        const itemId = await db.saleItems.add(record);
        itemRecords.push({ ...record, id: itemId });
      }

      return {
        sale: { ...saleRecord, id: saleId },
        items: itemRecords,
      };
    });
  },

  async getAllSalesWithItems(): Promise<SaleWithItems[]> {
    const [sales, allItems] = await Promise.all([
      db.sales.orderBy('saleDate').reverse().toArray(),
      db.saleItems.toArray(),
    ]);

    const itemsBySale = new Map<number, SaleItem[]>();
    for (const item of allItems) {
      const list = itemsBySale.get(item.saleId) ?? [];
      list.push(item);
      itemsBySale.set(item.saleId, list);
    }

    return sales.map((sale) => ({
      sale,
      items: sale.id !== undefined ? itemsBySale.get(sale.id) ?? [] : [],
    }));
  },

  async getSaleWithItems(saleId: number): Promise<SaleWithItems | null> {
    const sale = await db.sales.get(saleId);
    if (!sale) return null;
    const items = await db.saleItems.where('saleId').equals(saleId).toArray();
    return { sale, items };
  },
};

export const settingsRepo = {
  async getSettings(): Promise<AppSettings> {
    return ensureDefaultSettings();
  },

  async updateSettings(updates: Partial<Omit<AppSettings, 'id'>>): Promise<AppSettings> {
    const current = await ensureDefaultSettings();
    const next: AppSettings = {
      ...current,
      ...updates,
      id: 1,
      shopName: (updates.shopName ?? current.shopName).trim() || DEFAULT_SETTINGS.shopName,
      currency: (updates.currency ?? current.currency).trim() || 'IQD',
      receiptFooter: updates.receiptFooter ?? current.receiptFooter,
    };
    await db.settings.put(next);
    return next;
  },
};

export const backupRepo = {
  async exportAllData(): Promise<DatabaseBackup> {
    const [products, sales, saleItems, settings] = await Promise.all([
      db.products.toArray(),
      db.sales.toArray(),
      db.saleItems.toArray(),
      db.settings.toArray(),
    ]);

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: 'Lumina Cosmetics POS',
      data: {
        products,
        sales,
        saleItems,
        settings: settings.length > 0 ? settings : [DEFAULT_SETTINGS],
      },
    };
  },

  async importBackupData(
    backup: DatabaseBackup,
    mode: 'replace' | 'merge'
  ): Promise<{ productsCount: number; salesCount: number }> {
    if (!backup || !backup.data || !Array.isArray(backup.data.products) || !Array.isArray(backup.data.sales)) {
      throw new Error('Invalid backup file structure.');
    }

    await db.transaction('rw', db.products, db.sales, db.saleItems, db.settings, async () => {
      if (mode === 'replace') {
        await Promise.all([
          db.products.clear(),
          db.sales.clear(),
          db.saleItems.clear(),
          db.settings.clear(),
        ]);

        if (backup.data.products.length > 0) {
          await db.products.bulkPut(backup.data.products);
        }
        if (backup.data.sales.length > 0) {
          await db.sales.bulkPut(backup.data.sales);
        }
        if (Array.isArray(backup.data.saleItems) && backup.data.saleItems.length > 0) {
          await db.saleItems.bulkPut(backup.data.saleItems);
        }
        if (Array.isArray(backup.data.settings) && backup.data.settings.length > 0) {
          await db.settings.put({ ...DEFAULT_SETTINGS, ...backup.data.settings[0], id: 1 });
        } else {
          await db.settings.put(DEFAULT_SETTINGS);
        }
      } else {
        for (const p of backup.data.products) {
          const existing = await db.products.where('barcode').equals(p.barcode).first();
          if (!existing) {
            const { id: _ignored, ...rest } = p;
            await db.products.add(rest);
          }
        }
        for (const s of backup.data.sales) {
          const existingSale = await db.sales.where('receiptNumber').equals(s.receiptNumber).first();
          if (!existingSale) {
            const oldId = s.id;
            const { id: _ignored, ...saleRest } = s;
            const newSaleId = await db.sales.add(saleRest);
            const matchingItems = (backup.data.saleItems ?? []).filter((item) => item.saleId === oldId);
            for (const item of matchingItems) {
              const { id: _itemId, saleId: _oldSaleId, ...itemRest } = item;
              await db.saleItems.add({ ...itemRest, saleId: newSaleId });
            }
          }
        }
      }
    });

    const [productsCount, salesCount] = await Promise.all([db.products.count(), db.sales.count()]);
    return { productsCount, salesCount };
  },
};
