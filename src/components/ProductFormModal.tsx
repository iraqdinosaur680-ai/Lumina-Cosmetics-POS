import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, RefreshCw, Trash2, X } from 'lucide-react';
import type { Product } from '../types/pos';
import {
  compressImageFile,
  DEFAULT_COSMETIC_CATEGORIES,
  generateInternalBarcode,
} from '../utils/formatters';
import { normalizeBarcodeInput } from '../services/barcodeService';
import { useTranslation } from '../hooks/useTranslation';
import { IqdPriceInput } from './IqdPriceInput';

interface ProductFormModalProps {
  isOpen: boolean;
  editingProduct?: Product | null;
  initialBarcode?: string;
  existingCategories?: string[];
  onClose: () => void;
  onSave: (
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
    editingId?: number
  ) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  editingProduct,
  initialBarcode = '',
  existingCategories = [],
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [category, setCategory] = useState('Skincare');
  const [customCategory, setCustomCategory] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allCategories = Array.from(
    new Set([...DEFAULT_COSMETIC_CATEGORIES, ...existingCategories])
  );

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editingProduct) {
      setName(editingProduct.name);
      setBarcode(editingProduct.barcode);
      setPrice(editingProduct.price);
      if (allCategories.includes(editingProduct.category)) {
        setCategory(editingProduct.category);
        setCustomCategory('');
      } else {
        setCategory('__custom__');
        setCustomCategory(editingProduct.category);
      }
      setImage(editingProduct.image);
      requestAnimationFrame(() => nameInputRef.current?.focus());
    } else {
      setName('');
      setBarcode(initialBarcode);
      setPrice(null);
      setCategory('Skincare');
      setCustomCategory('');
      setImage(undefined);
      requestAnimationFrame(() => {
        if (initialBarcode) {
          nameInputRef.current?.focus();
        } else {
          barcodeInputRef.current?.focus();
        }
      });
    }
  }, [isOpen, editingProduct, initialBarcode]);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setImage(compressed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanBarcode = normalizeBarcodeInput(barcode);
    const resolvedCategory =
      category === '__custom__' ? customCategory.trim() || 'Other' : category;

    if (!cleanName) {
      setError('Product name is required.');
      nameInputRef.current?.focus();
      return;
    }
    if (!cleanBarcode) {
      setError('Barcode is required.');
      barcodeInputRef.current?.focus();
      return;
    }
    if (price === null || !Number.isFinite(price) || price < 0) {
      setError('Enter a valid selling price in IQD.');
      priceInputRef.current?.focus();
      return;
    }

    setSaving(true);
    try {
      await onSave(
        {
          name: cleanName,
          barcode: cleanBarcode,
          price: Math.round(price),
          category: resolvedCategory,
          image,
        },
        editingProduct?.id
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[1px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 id="product-modal-title" className="text-lg font-semibold text-slate-900">
            {editingProduct ? t.products.editModalTitle : t.products.addModalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Barcode Input */}
          <div>
            <label htmlFor="product-barcode" className="block text-sm font-medium text-slate-700 mb-1.5">
              {t.products.barcodeLabel} <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-2">
              <input
                ref={barcodeInputRef}
                id="product-barcode"
                dir="ltr"
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setBarcode((prev) => normalizeBarcodeInput(prev));
                    nameInputRef.current?.focus();
                  }
                }}
                placeholder={t.products.barcodePlaceholder}
                className="flex-1 px-3.5 py-2.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D174D]/20 focus:border-[#9D174D]"
              />
              <button
                type="button"
                onClick={() => setBarcode(generateInternalBarcode())}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t.products.generateBtn}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">{t.products.barcodeHint}</p>
          </div>

          {/* Product Name */}
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              {t.products.nameLabel} <span className="text-red-600">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="product-name"
              dir="auto"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.products.namePlaceholder}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D174D]/20 focus:border-[#9D174D]"
            />
          </div>

          {/* IQD Smart Price & Category */}
          <div className="grid grid-cols-2 gap-4 items-start">
            <div>
              <label htmlFor="product-price" className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.products.priceLabel} <span className="text-red-600">*</span>
              </label>
              <IqdPriceInput
                id="product-price"
                inputRef={priceInputRef}
                value={price}
                onChange={setPrice}
                placeholder="15,000"
              />
              <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                {t.products.priceHint}
              </p>
            </div>

            <div>
              <label htmlFor="product-category" className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.products.categoryLabel}
              </label>
              <select
                id="product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D174D]/20 focus:border-[#9D174D]"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__custom__">{t.products.customCategoryOption}</option>
              </select>
            </div>
          </div>

          {category === '__custom__' && (
            <div>
              <label htmlFor="custom-category" className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.products.customCategoryLabel}
              </label>
              <input
                id="custom-category"
                dir="auto"
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder={t.products.customCategoryPlaceholder}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D174D]/20 focus:border-[#9D174D]"
              />
            </div>
          )}

          {/* Optional Product Image */}
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-1.5">
              {t.products.imageLabel}
            </span>
            <div className="flex items-center gap-4">
              {image ? (
                <div className="relative w-16 h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                  <img
                    src={image}
                    alt={name || 'Product thumbnail'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <ImagePlus className="w-5 h-5" />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                >
                  {image ? t.products.replaceImageBtn : t.products.uploadImageBtn}
                </button>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage(undefined)}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t.products.removeImageBtn}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#9D174D] rounded-lg hover:bg-[#831843] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
            >
              {saving
                ? t.common.saving
                : editingProduct
                  ? t.products.saveChangesBtn
                  : t.products.saveProductBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
