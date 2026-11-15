import { db, DEFAULT_SETTINGS, ensureDefaultSettings } from './db';
import type {
  AppSettings,
  CartItem,
  DatabaseBackup,
  Expense,
  Product,
  Sale,
  SaleItem,
  SaleWithItems,
  StaffProfile,
} from '../types/pos';
import { formatReceiptNumber } from '../services/barcodeService';

export const DEFAULT_REORDER_POINT = 5;

export function getEffectiveReorderPoint(product: Pick<Product, 'reorderPoint'>): number {
  return product.reorderPoint !== undefined && Number.isFinite(product.reorderPoint)
    ? Math.max(0, Math.round(product.reorderPoint))
    : DEFAULT_REORDER_POINT;
}

export function isProductBelowReorderPoint(
  product: Pick<Product, 'stock' | 'reorderPoint'>
): boolean {
  if (product.stock === undefined || !Number.isFinite(product.stock)) {
    return false;
  }
  const threshold = getEffectiveReorderPoint(product);
  if (product.reorderPoint !== undefined) {
    return product.stock < threshold || product.stock <= 0;
  }
  return product.stock <= threshold;
}

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
      buyingPrice:
        input.buyingPrice !== undefined && Number.isFinite(input.buyingPrice)
          ? Math.max(0, Math.round(input.buyingPrice))
          : undefined,
      stock:
        input.stock !== undefined && Number.isFinite(input.stock)
          ? Math.max(0, Math.round(input.stock))
          : undefined,
      reorderPoint:
        input.reorderPoint !== undefined && Number.isFinite(input.reorderPoint)
          ? Math.max(0, Math.round(input.reorderPoint))
          : undefined,
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

    const nextBuyingPrice =
      'buyingPrice' in updates
        ? updates.buyingPrice !== undefined && Number.isFinite(updates.buyingPrice)
          ? Math.max(0, Math.round(updates.buyingPrice))
          : undefined
        : current.buyingPrice;

    const nextStock =
      'stock' in updates
        ? updates.stock !== undefined && Number.isFinite(updates.stock)
          ? Math.max(0, Math.round(updates.stock))
          : undefined
        : current.stock;

    const nextReorderPoint =
      'reorderPoint' in updates
        ? updates.reorderPoint !== undefined && Number.isFinite(updates.reorderPoint)
          ? Math.max(0, Math.round(updates.reorderPoint))
          : undefined
        : current.reorderPoint;

    const updated: Product = {
      ...current,
      name: updates.name !== undefined ? updates.name.trim() : current.name,
      barcode: nextBarcode,
      price: updates.price !== undefined ? Math.max(0, Math.round(updates.price)) : current.price,
      buyingPrice: nextBuyingPrice,
      stock: nextStock,
      reorderPoint: nextReorderPoint,
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
      { name: 'Velvet Matte Lipstick - Rose Noir', barcode: '6281001100014', price: 18000, buyingPrice: 11000, stock: 24, category: 'Makeup' },
      { name: 'Hyaluronic Hydrating Serum 30ml', barcode: '6281001100021', price: 28000, buyingPrice: 18500, stock: 16, category: 'Skincare' },
      { name: 'Botanical Rosewater Mist 150ml', barcode: '6281001100038', price: 15000, buyingPrice: 9000, stock: 20, category: 'Skincare' },
      { name: 'Oud & Amber Eau de Parfum 50ml', barcode: '6281001100045', price: 65000, buyingPrice: 42000, stock: 8, category: 'Fragrance' },
      { name: 'Silk Lash Volume Mascara', barcode: '6281001100052', price: 14500, buyingPrice: 8500, stock: 30, category: 'Makeup' },
      { name: 'Argan Repair Hair Elixir 100ml', barcode: '6281001100069', price: 22000, buyingPrice: 13500, stock: 14, category: 'Haircare' },
      { name: 'Shea & Vanilla Body Butter 200g', barcode: '6281001100076', price: 19500, buyingPrice: 12000, stock: 18, category: 'Body Care' },
      { name: 'سيروم فيتامين سي للوجه', barcode: '6281001100083', price: 24000, buyingPrice: 15000, stock: 22, category: 'Skincare' },
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
   * Persist completed sale, immutable item snapshots, staff attribution, and stock decrements
   * inside an atomic IndexedDB transaction.
   */
  async createSaleTransaction(
    cartItems: CartItem[],
    options?: {
      finalTotalOverride?: number | null;
      staff?: StaffProfile | null;
    }
  ): Promise<SaleWithItems> {
    if (cartItems.length === 0) {
      throw new Error('Cannot checkout an empty cart.');
    }

    return db.transaction('rw', db.sales, db.saleItems, db.products, async () => {
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
      const subtotalAmount = Math.round(
        cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      );
      const finalAmount =
        options?.finalTotalOverride !== undefined && options?.finalTotalOverride !== null
          ? Math.max(0, Math.round(options.finalTotalOverride))
          : subtotalAmount;
      const discountAmount = Math.max(0, subtotalAmount - finalAmount);

      let totalCost = 0;
      const itemRecords: SaleItem[] = [];

      const saleRecord: Omit<Sale, 'id'> = {
        receiptNumber,
        subtotalAmount,
        discountAmount,
        totalAmount: finalAmount,
        totalCost: 0,
        staffId: options?.staff?.id,
        staffNameSnapshot: options?.staff?.name,
        saleDate,
      };

      const saleId = await db.sales.add(saleRecord);

      for (const item of cartItems) {
        const dbProduct =
          item.productId !== undefined
            ? await db.products.get(item.productId)
            : await db.products.where('barcode').equals(item.barcode).first();

        const unitBuyingPrice = item.buyingPrice ?? dbProduct?.buyingPrice;
        if (unitBuyingPrice !== undefined) {
          totalCost += unitBuyingPrice * item.quantity;
        }

        // Decrement stock if tracked on this product
        if (dbProduct && dbProduct.id !== undefined && dbProduct.stock !== undefined) {
          const nextStock = Math.max(0, dbProduct.stock - item.quantity);
          await db.products.update(dbProduct.id, {
            stock: nextStock,
            updatedAt: saleDate,
          });
        }

        const lineSubtotal = Math.round(item.unitPrice * item.quantity);
        const record: Omit<SaleItem, 'id'> = {
          saleId,
          productId: item.productId ?? dbProduct?.id,
          productNameSnapshot: item.name,
          barcodeSnapshot: item.barcode,
          unitPriceSnapshot: Math.round(item.unitPrice),
          buyingPriceSnapshot: unitBuyingPrice,
          quantity: item.quantity,
          subtotal: lineSubtotal,
        };
        const itemId = await db.saleItems.add(record);
        itemRecords.push({ ...record, id: itemId });
      }

      const roundedCost = Math.round(totalCost);
      await db.sales.update(saleId, { totalCost: roundedCost });

      return {
        sale: { ...saleRecord, totalCost: roundedCost, id: saleId },
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

export const expenseRepo = {
  async getAll(): Promise<Expense[]> {
    return db.expenses.orderBy('date').reverse().toArray();
  },

  async create(input: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const cleanTitle = input.title.trim();
    if (!cleanTitle) {
      throw new Error('Expense title is required.');
    }
    const record: Omit<Expense, 'id'> = {
      title: cleanTitle,
      amount: Math.max(0, Math.round(input.amount)),
      category: input.category.trim() || 'Other',
      note: input.note?.trim() || undefined,
      date: input.date || new Date().toISOString(),
      staffId: input.staffId,
      staffNameSnapshot: input.staffNameSnapshot,
      createdAt: new Date().toISOString(),
    };
    const id = await db.expenses.add(record);
    return { ...record, id };
  },

  async remove(id: number): Promise<void> {
    await db.expenses.delete(id);
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
      staffProfiles: updates.staffProfiles ?? current.staffProfiles,
    };
    await db.settings.put(next);
    return next;
  },

  async updateStaffName(id: '1' | '2' | '3', name: string): Promise<AppSettings> {
    const current = await ensureDefaultSettings();
    const cleanName = name.trim() || `Cashier ${id}`;
    const updatedProfiles = current.staffProfiles.map((p) =>
      p.id === id ? { ...p, name: cleanName } : p
    );
    return this.updateSettings({ staffProfiles: updatedProfiles });
  },
};

export const backupRepo = {
  async exportAllData(): Promise<DatabaseBackup> {
    const [products, sales, saleItems, expenses, settings] = await Promise.all([
      db.products.toArray(),
      db.sales.toArray(),
      db.saleItems.toArray(),
      db.expenses.toArray(),
      db.settings.toArray(),
    ]);

    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      app: 'Lumina Cosmetics POS',
      data: {
        products,
        sales,
        saleItems,
        expenses,
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

    await db.transaction('rw', db.products, db.sales, db.saleItems, db.expenses, db.settings, async () => {
      if (mode === 'replace') {
        await Promise.all([
          db.products.clear(),
          db.sales.clear(),
          db.saleItems.clear(),
          db.expenses.clear(),
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
        if (Array.isArray(backup.data.expenses) && backup.data.expenses.length > 0) {
          await db.expenses.bulkPut(backup.data.expenses);
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
        if (Array.isArray(backup.data.expenses)) {
          for (const exp of backup.data.expenses) {
            const { id: _ignored, ...expRest } = exp;
            await db.expenses.add(expRest);
          }
        }
      }
    });

    const [productsCount, salesCount] = await Promise.all([db.products.count(), db.sales.count()]);
    return { productsCount, salesCount };
  },
};
