import React, { useMemo, useState } from 'react';
import { Package, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS } from '../database/db';
import { productRepo } from '../database/repositories';
import { usePos } from '../context/PosContext';
import { useTranslation } from '../hooks/useTranslation';
import { interpolate } from '../i18n/translations';
import type { Product } from '../types/pos';
import { formatCurrency } from '../utils/formatters';
import { ProductFormModal } from '../components/ProductFormModal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const ProductsPage: React.FC = () => {
  const settings = useLiveQuery(() => db.settings.get(1), []) ?? DEFAULT_SETTINGS;
  const products = useLiveQuery(() => db.products.orderBy('updatedAt').reverse().toArray(), []) ?? [];
  const { addProductToCart, setFeedback } = usePos();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category))).sort();
    return ['All', ...unique];
  }, [products]);

  const existingCategories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery, selectedCategory]);

  const handleSave = async (
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
    editingId?: number
  ) => {
    if (editingId !== undefined) {
      await productRepo.update(editingId, data);
      setStatusMessage(interpolate(t.products.updatedToast, { name: data.name }));
    } else {
      await productRepo.create(data);
      setStatusMessage(interpolate(t.products.addedToast, { name: data.name }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct?.id) return;
    await productRepo.remove(deletingProduct.id);
    setStatusMessage(interpolate(t.products.deletedToast, { name: deletingProduct.name }));
    setDeletingProduct(null);
  };

  const handleSeedSamples = async () => {
    const count = await productRepo.seedSampleCatalog();
    setStatusMessage(
      count > 0
        ? interpolate(t.products.samplesLoadedToast, { count })
        : t.products.samplesExistToast
    );
  };

  const handleSelectProductToCashier = (product: Product) => {
    addProductToCart(product);
    const addedMessage = interpolate(t.cashier.addedMsg, {
      name: product.name,
      price: formatCurrency(product.price, settings.currency),
    });
    setFeedback({
      type: 'success',
      message: addedMessage,
    });
    setStatusMessage(addedMessage);
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Top Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              dir="auto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.products.searchPlaceholder}
              className="w-full ps-10 pe-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9D174D]/20 focus:border-[#9D174D]"
            />
          </div>

          <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
            {interpolate(t.products.countSummary, {
              filtered: filteredProducts.length,
              total: products.length,
            })}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleSeedSamples}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t.products.loadSamplesBtn}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#9D174D] rounded-lg hover:bg-[#831843] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t.products.addProductBtn}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs font-medium text-emerald-800 hover:underline"
          >
            {t.common.dismiss}
          </button>
        </div>
      )}

      {/* Category Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat === 'All' ? t.common.all : cat}
            </button>
          ))}
        </div>

        {filteredProducts.length > 0 && (
          <span className="text-xs text-slate-500">{t.products.clickToAdd}</span>
        )}
      </div>

      {/* Uniform Square Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            {products.length === 0 ? t.products.emptyTitle : t.products.noMatchTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {products.length === 0 ? t.products.emptySubtitle : t.products.noMatchSubtitle}
          </p>
          {products.length === 0 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setModalOpen(true);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#9D174D] rounded-lg hover:bg-[#831843] transition-colors"
              >
                {t.products.addFirstBtn}
              </button>
              <button
                type="button"
                onClick={handleSeedSamples}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {t.products.loadCatalogBtn}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id ?? product.barcode}
              className="group relative aspect-square bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden hover:border-[#9D174D]/50 hover:shadow-md transition-all"
            >
              {/* Primary Card Click Surface -> Adds directly to Cashier & navigates */}
              <button
                type="button"
                onClick={() => handleSelectProductToCashier(product)}
                title={t.products.clickToAdd}
                className="w-full h-full flex flex-col text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9D174D] cursor-pointer"
              >
                {/* Top Visual Area (~56% of square height) */}
                <div className="w-full flex-1 min-h-0 bg-slate-50 border-b border-slate-100 overflow-hidden flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400">
                      <span className="text-2xl font-bold tracking-tight text-slate-400/90 select-none">
                        {product.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Product Details (~44% of square height) */}
                <div className="w-full p-3.5 flex flex-col justify-between gap-1.5 shrink-0 bg-white">
                  <div className="text-[11px] text-slate-500 truncate">{product.category}</div>
                  <div
                    dir="auto"
                    className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.4rem]"
                    title={product.name}
                  >
                    {product.name}
                  </div>
                  <div className="flex items-baseline justify-between gap-2 pt-1">
                    <span
                      dir="ltr"
                      className="text-sm font-bold font-mono tabular-nums text-[#9D174D] whitespace-nowrap"
                    >
                      {formatCurrency(product.price, settings.currency)}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums text-slate-400 truncate">
                      {product.barcode}
                    </span>
                  </div>
                </div>
              </button>

              {/* Isolated, Always-Obvious Edit & Delete Controls */}
              <div className="absolute top-2.5 end-2.5 z-10 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProduct(product);
                    setModalOpen(true);
                  }}
                  className="p-2 rounded-lg bg-white/95 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-xs transition-colors"
                  aria-label={`${t.common.edit} ${product.name}`}
                  title={t.common.edit}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingProduct(product);
                  }}
                  className="p-2 rounded-lg bg-white/95 border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 shadow-xs transition-colors"
                  aria-label={`${t.common.delete} ${product.name}`}
                  title={t.common.delete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <ProductFormModal
        isOpen={modalOpen}
        editingProduct={editingProduct}
        existingCategories={existingCategories}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        title={t.products.deleteTitle}
        message={`${interpolate(t.products.deleteMsgPrefix, {
          name: deletingProduct?.name ?? '',
        })} ${t.products.deleteMsgSuffix}`}
        confirmLabel={t.products.deleteConfirmBtn}
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
};
