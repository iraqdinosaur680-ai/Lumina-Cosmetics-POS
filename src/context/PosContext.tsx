import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS } from '../database/db';
import { productRepo, salesRepo } from '../database/repositories';
import { useTranslation } from '../hooks/useTranslation';
import { interpolate } from '../i18n/translations';
import { normalizeBarcodeInput, ScanDeduplicator } from '../services/barcodeService';
import { printService } from '../services/printService';
import type { CartItem, Product, ReceiptData, SaleWithItems } from '../types/pos';
import { formatCurrency } from '../utils/formatters';

export interface ScanFeedback {
  type: 'success' | 'unknown' | 'error';
  message: string;
  unknownBarcode?: string;
}

interface PrintFailureState {
  saleWithItems: SaleWithItems;
  errorMessage: string;
}

interface PosContextValue {
  cart: CartItem[];
  totalItems: number;
  subtotal: number;
  finalAmount: number;
  feedback: ScanFeedback | null;
  setFeedback: React.Dispatch<React.SetStateAction<ScanFeedback | null>>;
  lastCompletedSale: SaleWithItems | null;
  printFailureState: PrintFailureState | null;
  isCheckingOut: boolean;
  printReceipt: ReceiptData | null;
  setPrintReceipt: React.Dispatch<React.SetStateAction<ReceiptData | null>>;
  registerModalOpen: boolean;
  registerBarcode: string;
  openRegisterModal: (barcode: string) => void;
  closeRegisterModal: () => void;
  addProductToCart: (product: Product) => void;
  updateQuantity: (barcode: string, nextQty: number) => void;
  updateItemPrice: (barcode: string, nextPrice: number) => void;
  removeCartItem: (barcode: string) => void;
  clearCart: () => void;
  clearPrintFailureOnly: () => void;
  processScannedBarcode: (rawBarcode: string) => Promise<void>;
  buildReceiptFromSale: (saleWithItems: SaleWithItems) => ReceiptData;
  buildDraftReceipt: () => ReceiptData;
  executePrint: (receipt: ReceiptData) => Promise<void>;
  handleCheckout: (shouldPrint: boolean) => Promise<void>;
  handleSaveNewProductFromUnknown: (
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
}

const PosContext = createContext<PosContextValue | null>(null);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const settings = useLiveQuery(() => db.settings.get(1), []) ?? DEFAULT_SETTINGS;
  const { t } = useTranslation();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  const [lastCompletedSale, setLastCompletedSale] = useState<SaleWithItems | null>(null);
  const [printFailureState, setPrintFailureState] = useState<PrintFailureState | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [printReceipt, setPrintReceipt] = useState<ReceiptData | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerBarcode, setRegisterBarcode] = useState('');

  const deduplicatorRef = useRef(new ScanDeduplicator());

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );
  const finalAmount = subtotal;

  const addProductToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.barcode === product.barcode);
      if (existingIndex !== -1) {
        return prev.map((item, idx) => {
          if (idx !== existingIndex) return item;
          const nextQty = item.quantity + 1;
          return {
            ...item,
            quantity: nextQty,
            subtotal: nextQty * item.unitPrice,
          };
        });
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          barcode: product.barcode,
          unitPrice: product.price,
          quantity: 1,
          subtotal: product.price,
          image: product.image,
        },
      ];
    });
  }, []);

  const processScannedBarcode = useCallback(
    async (rawBarcode: string) => {
      const cleaned = normalizeBarcodeInput(rawBarcode);
      if (!cleaned) return;
      if (deduplicatorRef.current.shouldIgnore(cleaned)) return;

      try {
        const product = await productRepo.getByBarcode(cleaned);
        if (product) {
          addProductToCart(product);
          setFeedback({
            type: 'success',
            message: interpolate(t.cashier.addedMsg, {
              name: product.name,
              price: formatCurrency(product.price, settings.currency),
            }),
          });
          setLastCompletedSale(null);
        } else {
          setFeedback({
            type: 'unknown',
            message: interpolate(t.cashier.unknownBarcodeMsg, { barcode: cleaned }),
            unknownBarcode: cleaned,
          });
        }
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'Database lookup failed.',
        });
      }
    },
    [addProductToCart, settings.currency, t.cashier.addedMsg, t.cashier.unknownBarcodeMsg]
  );

  const updateQuantity = useCallback((barcode: string, nextQty: number) => {
    if (nextQty <= 0) {
      setCart((prev) => prev.filter((item) => item.barcode !== barcode));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.barcode === barcode
          ? { ...item, quantity: nextQty, subtotal: nextQty * item.unitPrice }
          : item
      )
    );
  }, []);

  const updateItemPrice = useCallback((barcode: string, nextPrice: number) => {
    const cleanPrice = Math.max(0, Math.round(nextPrice));
    setCart((prev) =>
      prev.map((item) =>
        item.barcode === barcode
          ? { ...item, unitPrice: cleanPrice, subtotal: cleanPrice * item.quantity }
          : item
      )
    );
  }, []);

  const removeCartItem = useCallback((barcode: string) => {
    setCart((prev) => prev.filter((item) => item.barcode !== barcode));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const clearPrintFailureOnly = useCallback(() => {
    setPrintFailureState((prev) => {
      if (prev) setLastCompletedSale(prev.saleWithItems);
      return null;
    });
    setCart([]);
  }, []);

  const openRegisterModal = useCallback((barcode: string) => {
    setRegisterBarcode(barcode);
    setRegisterModalOpen(true);
  }, []);

  const closeRegisterModal = useCallback(() => {
    setRegisterModalOpen(false);
  }, []);

  const buildReceiptFromSale = useCallback(
    (saleWithItems: SaleWithItems): ReceiptData => ({
      receiptNumber: saleWithItems.sale.receiptNumber,
      saleDate: saleWithItems.sale.saleDate,
      totalAmount: saleWithItems.sale.totalAmount,
      items: saleWithItems.items.map((item) => ({
        productName: item.productNameSnapshot,
        barcode: item.barcodeSnapshot,
        unitPrice: item.unitPriceSnapshot,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      settings,
    }),
    [settings]
  );

  const buildDraftReceipt = useCallback(
    (): ReceiptData => ({
      receiptNumber: 'PREVIEW',
      saleDate: new Date().toISOString(),
      totalAmount: finalAmount,
      items: cart.map((item) => ({
        productName: item.name,
        barcode: item.barcode,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      settings,
    }),
    [cart, finalAmount, settings]
  );

  const executePrint = useCallback(async (receipt: ReceiptData) => {
    setPrintReceipt(receipt);
    await printService.print(receipt);
  }, []);

  const handleCheckout = useCallback(
    async (shouldPrint: boolean) => {
      if (cart.length === 0 || isCheckingOut) return;

      if (printFailureState) {
        try {
          setIsCheckingOut(true);
          const receipt = buildReceiptFromSale(printFailureState.saleWithItems);
          await executePrint(receipt);
          setLastCompletedSale(printFailureState.saleWithItems);
          setPrintFailureState(null);
          setCart([]);
          setFeedback({
            type: 'success',
            message: interpolate(t.cashier.receiptPrintedClearedMsg, {
              receiptNumber: printFailureState.saleWithItems.sale.receiptNumber,
            }),
          });
        } catch (err) {
          setPrintFailureState({
            ...printFailureState,
            errorMessage: err instanceof Error ? err.message : 'Print failed again.',
          });
        } finally {
          setIsCheckingOut(false);
        }
        return;
      }

      setIsCheckingOut(true);
      setFeedback(null);

      let savedSale: SaleWithItems | null = null;
      try {
        savedSale = await salesRepo.createSaleTransaction(cart);
      } catch (dbErr) {
        setFeedback({
          type: 'error',
          message:
            dbErr instanceof Error
              ? dbErr.message
              : 'Failed to save transaction to local database.',
        });
        setIsCheckingOut(false);
        return;
      }

      if (!shouldPrint) {
        setLastCompletedSale(savedSale);
        setCart([]);
        setFeedback({
          type: 'success',
          message: interpolate(t.cashier.saleSavedMsg, {
            receiptNumber: savedSale.sale.receiptNumber,
            total: formatCurrency(savedSale.sale.totalAmount, settings.currency),
          }),
        });
        setIsCheckingOut(false);
        return;
      }

      try {
        const receipt = buildReceiptFromSale(savedSale);
        await executePrint(receipt);
        setLastCompletedSale(savedSale);
        setCart([]);
        setFeedback({
          type: 'success',
          message: interpolate(t.cashier.salePrintedMsg, {
            receiptNumber: savedSale.sale.receiptNumber,
          }),
        });
      } catch (printErr) {
        setPrintFailureState({
          saleWithItems: savedSale,
          errorMessage:
            printErr instanceof Error
              ? printErr.message
              : 'Printer error occurred. Your cart has been preserved.',
        });
      } finally {
        setIsCheckingOut(false);
      }
    },
    [
      buildReceiptFromSale,
      cart,
      executePrint,
      isCheckingOut,
      printFailureState,
      settings.currency,
      t.cashier.receiptPrintedClearedMsg,
      t.cashier.salePrintedMsg,
      t.cashier.saleSavedMsg,
    ]
  );

  const handleSaveNewProductFromUnknown = useCallback(
    async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      const created = await productRepo.create(data);
      addProductToCart(created);
      setFeedback({
        type: 'success',
        message: interpolate(t.cashier.registeredAndAddedMsg, { name: created.name }),
      });
    },
    [addProductToCart, t.cashier.registeredAndAddedMsg]
  );

  const value: PosContextValue = {
    cart,
    totalItems,
    subtotal,
    finalAmount,
    feedback,
    setFeedback,
    lastCompletedSale,
    printFailureState,
    isCheckingOut,
    printReceipt,
    setPrintReceipt,
    registerModalOpen,
    registerBarcode,
    openRegisterModal,
    closeRegisterModal,
    addProductToCart,
    updateQuantity,
    updateItemPrice,
    removeCartItem,
    clearCart,
    clearPrintFailureOnly,
    processScannedBarcode,
    buildReceiptFromSale,
    buildDraftReceipt,
    executePrint,
    handleCheckout,
    handleSaveNewProductFromUnknown,
  };

  return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
};

export function usePos(): PosContextValue {
  const ctx = useContext(PosContext);
  if (!ctx) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return ctx;
}
