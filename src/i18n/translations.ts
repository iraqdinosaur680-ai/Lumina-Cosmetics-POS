import type { AppLanguage } from '../types/pos';

export interface Translations {
  // Navigation & Shell
  nav: {
    cashier: string;
    products: string;
    history: string;
    settings: string;
    pointOfSale: string;
    currencyLabel: string;
    receiptLabel: string;
    languageLabel: string;
    installDesktopApp: string;
    installApp: string;
    offlineIndicator: string;
  };
  // Common
  common: {
    cancel: string;
    save: string;
    saving: string;
    close: string;
    delete: string;
    edit: string;
    dismiss: string;
    confirm: string;
    all: string;
    search: string;
  };
  // Cashier Screen
  cashier: {
    scannerTitle: string;
    scannerHint: string;
    scannerPlaceholder: string;
    addBarcodeBtn: string;
    quickSearchPlaceholder: string;
    activeCartTitle: string;
    itemSingular: string;
    itemPlural: string;
    clearCart: string;
    readyTitle: string;
    readySubtitle: string;
    lastSalePrefix: string;
    reprintReceipt: string;
    colProduct: string;
    colUnitPrice: string;
    colQty: string;
    colSubtotal: string;
    checkoutSummary: string;
    thermalFormat: string;
    totalUnits: string;
    distinctProducts: string;
    subtotal: string;
    finalTotal: string;
    processingSale: string;
    checkoutAndPrintBtn: string;
    saveWithoutPrint: string;
    previewReceipt: string;
    shortcutHint: string;
    registerProductBtn: string;
    printFailedTitle: string;
    printFailedSubtitle: string;
    retryPrintBtn: string;
    clearCartOnlyBtn: string;
    clearCartModalTitle: string;
    clearCartModalMsg: string;
    addedMsg: string;
    unknownBarcodeMsg: string;
    registeredAndAddedMsg: string;
    saleSavedMsg: string;
    salePrintedMsg: string;
    receiptPrintedClearedMsg: string;
    editPriceTitle: string;
  };
  // Products Page & Modal
  products: {
    searchPlaceholder: string;
    countSummary: string;
    loadSamplesBtn: string;
    addProductBtn: string;
    emptyTitle: string;
    noMatchTitle: string;
    emptySubtitle: string;
    noMatchSubtitle: string;
    addFirstBtn: string;
    loadCatalogBtn: string;
    colProduct: string;
    colBarcode: string;
    colCategory: string;
    colPrice: string;
    colUpdated: string;
    colActions: string;
    editModalTitle: string;
    addModalTitle: string;
    barcodeLabel: string;
    barcodePlaceholder: string;
    generateBtn: string;
    barcodeHint: string;
    nameLabel: string;
    namePlaceholder: string;
    priceLabel: string;
    priceHint: string;
    categoryLabel: string;
    customCategoryOption: string;
    customCategoryLabel: string;
    customCategoryPlaceholder: string;
    imageLabel: string;
    uploadImageBtn: string;
    replaceImageBtn: string;
    removeImageBtn: string;
    saveChangesBtn: string;
    saveProductBtn: string;
    deleteTitle: string;
    deleteMsgPrefix: string;
    deleteMsgSuffix: string;
    deleteConfirmBtn: string;
    updatedToast: string;
    addedToast: string;
    deletedToast: string;
    samplesLoadedToast: string;
    samplesExistToast: string;
    clickToAdd: string;
  };
  // Sales History
  history: {
    filteredTotal: string;
    todayTotal: string;
    receiptsIssued: string;
    averageBasket: string;
    presetToday: string;
    presetYesterday: string;
    presetWeek: string;
    presetAll: string;
    presetCustom: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptySubtitle: string;
    colReceiptNo: string;
    colDateTime: string;
    colItems: string;
    colTotal: string;
    colActions: string;
    unitSingular: string;
    unitPlural: string;
    moreSuffix: string;
    detailsBtn: string;
    reprintBtn: string;
    receiptTitlePrefix: string;
    colProductSnapshot: string;
    colUnitPrice: string;
    colQty: string;
    colSubtotal: string;
    totalAmount: string;
  };
  // Settings & Print Preview
  settings: {
    storeSectionTitle: string;
    storeSectionSubtitle: string;
    shopNameLabel: string;
    currencyLabel: string;
    receiptWidthLabel: string;
    thermalSuffix: string;
    receiptLangLabel: string;
    langBilingual: string;
    langEnglish: string;
    langArabic: string;
    appLanguageLabel: string;
    footerLabel: string;
    autoPrintLabel: string;
    saveSettingsBtn: string;
    savedToast: string;
    backupTitle: string;
    backupSubtitle: string;
    productsCountLabel: string;
    salesCountLabel: string;
    exportBtn: string;
    importBtn: string;
    importModeLabel: string;
    modeMerge: string;
    modeReplace: string;
    livePreviewTitle: string;
    replaceTitle: string;
    mergeTitle: string;
    replaceConfirmBtn: string;
    mergeConfirmBtn: string;
    previewModalTitle: string;
    paperWidthLabel: string;
    printReceiptBtn: string;
    preparingPrint: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  en: {
    nav: {
      cashier: 'Cashier',
      products: 'Products',
      history: 'Sales History',
      settings: 'Settings',
      pointOfSale: 'Point of Sale',
      currencyLabel: 'Currency',
      receiptLabel: 'Receipt',
      languageLabel: 'Language',
      installDesktopApp: 'Install Desktop App',
      installApp: 'Install App',
      offlineIndicator: 'Offline Mode — Local IndexedDB Active',
    },
    common: {
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      close: 'Close',
      delete: 'Delete',
      edit: 'Edit',
      dismiss: 'Dismiss',
      confirm: 'Confirm',
      all: 'All',
      search: 'Search',
    },
    cashier: {
      scannerTitle: 'Barcode Scanner Input',
      scannerHint: 'USB / Bluetooth HID ready · Press Enter or F2 to focus',
      scannerPlaceholder: 'Scan product barcode or type barcode manually...',
      addBarcodeBtn: 'Add Barcode',
      quickSearchPlaceholder: 'Quick search product by name or category...',
      activeCartTitle: 'Active Shopping Cart',
      itemSingular: 'item',
      itemPlural: 'items',
      clearCart: 'Clear Cart',
      readyTitle: 'Ready for next customer',
      readySubtitle: 'Scan a product barcode with your scanner or search by name above to start building the receipt.',
      lastSalePrefix: 'Last Sale',
      reprintReceipt: 'Reprint Receipt',
      colProduct: 'Product',
      colUnitPrice: 'Unit Price',
      colQty: 'Quantity',
      colSubtotal: 'Subtotal',
      checkoutSummary: 'Checkout Summary',
      thermalFormat: 'Thermal format',
      totalUnits: 'Total Items (Units)',
      distinctProducts: 'Distinct Products',
      subtotal: 'Subtotal',
      finalTotal: 'Final Total',
      processingSale: 'Processing Sale...',
      checkoutAndPrintBtn: 'PRINT RECEIPT / CHECKOUT',
      saveWithoutPrint: 'Save Without Print',
      previewReceipt: 'Preview Receipt',
      shortcutHint: 'Shortcut: Press F9 to complete checkout',
      registerProductBtn: 'Register Product',
      printFailedTitle: 'Printing failed for Receipt #{receiptNumber} — Cart preserved',
      printFailedSubtitle: 'Transaction was saved locally.',
      retryPrintBtn: 'Retry Print & Clear Cart',
      clearCartOnlyBtn: 'Clear Cart Only',
      clearCartModalTitle: 'Clear Shopping Cart?',
      clearCartModalMsg: 'All scanned items in the current cart will be removed. Completed sales in history are not affected.',
      addedMsg: 'Added {name} ({price})',
      unknownBarcodeMsg: 'Barcode "{barcode}" is not registered in your catalog.',
      registeredAndAddedMsg: 'Registered "{name}" and added to cart.',
      saleSavedMsg: 'Sale #{receiptNumber} saved ({total}).',
      salePrintedMsg: 'Sale #{receiptNumber} completed and printed.',
      receiptPrintedClearedMsg: 'Receipt #{receiptNumber} printed and cart cleared.',
      editPriceTitle: 'Click to adjust unit price',
    },
    products: {
      searchPlaceholder: 'Search by product name, barcode, or category...',
      countSummary: '{filtered} of {total} products',
      loadSamplesBtn: 'Load Sample Cosmetics',
      addProductBtn: 'Add Product',
      emptyTitle: 'No products registered yet',
      noMatchTitle: 'No matching products',
      emptySubtitle: 'Add your first cosmetics item manually or load sample products to test scanning and checkout.',
      noMatchSubtitle: 'Try clearing your search filter or switching categories.',
      addFirstBtn: 'Add First Product',
      loadCatalogBtn: 'Load Sample Catalog',
      colProduct: 'Product',
      colBarcode: 'Barcode',
      colCategory: 'Category',
      colPrice: 'Selling Price',
      colUpdated: 'Updated',
      colActions: 'Actions',
      editModalTitle: 'Edit Product',
      addModalTitle: 'Register New Product',
      barcodeLabel: 'Barcode',
      barcodePlaceholder: 'Scan barcode or type manually',
      generateBtn: 'Generate',
      barcodeHint: 'Scan with USB/Bluetooth scanner or generate a store barcode.',
      nameLabel: 'Product Name (English / Arabic)',
      namePlaceholder: 'e.g. Hyaluronic Hydrating Serum 30ml',
      priceLabel: 'Selling Price (IQD)',
      priceHint: 'Type 2 digits to auto-add 000 (e.g. 15 → 15,000), then add 250 / 500 / 750.',
      categoryLabel: 'Category',
      customCategoryOption: '+ Custom Category',
      customCategoryLabel: 'Custom Category Name',
      customCategoryPlaceholder: 'Enter category name',
      imageLabel: 'Product Image (Optional)',
      uploadImageBtn: 'Upload Image',
      replaceImageBtn: 'Replace Image',
      removeImageBtn: 'Remove',
      saveChangesBtn: 'Save Changes',
      saveProductBtn: 'Save Product',
      deleteTitle: 'Delete Product?',
      deleteMsgPrefix: '"{name}" will be permanently removed from your product catalog.',
      deleteMsgSuffix: 'Past sales receipts will preserve their historical product snapshots.',
      deleteConfirmBtn: 'Delete Product',
      updatedToast: 'Updated "{name}".',
      addedToast: 'Added "{name}" to catalog.',
      deletedToast: 'Deleted "{name}".',
      samplesLoadedToast: 'Loaded {count} sample cosmetics products into local database.',
      samplesExistToast: 'Sample products are already in the catalog.',
      clickToAdd: 'Click card to add to Cashier',
    },
    history: {
      filteredTotal: 'Filtered Sales Total',
      todayTotal: "Today's Total Sales",
      receiptsIssued: 'Receipts Issued',
      averageBasket: 'Average Basket',
      presetToday: 'Today',
      presetYesterday: 'Yesterday',
      presetWeek: 'Last 7 Days',
      presetAll: 'All Time',
      presetCustom: 'Pick Date',
      searchPlaceholder: 'Search receipt # or product name...',
      emptyTitle: 'No sales found for this period',
      emptySubtitle: 'Completed transactions from the Cashier screen will appear here with immutable item snapshots.',
      colReceiptNo: 'Receipt No',
      colDateTime: 'Date & Time',
      colItems: 'Items',
      colTotal: 'Total Amount',
      colActions: 'Actions',
      unitSingular: 'unit',
      unitPlural: 'units',
      moreSuffix: 'more',
      detailsBtn: 'Details',
      reprintBtn: 'Reprint',
      receiptTitlePrefix: 'Receipt',
      colProductSnapshot: 'Product Snapshot',
      colUnitPrice: 'Unit Price',
      colQty: 'Qty',
      colSubtotal: 'Subtotal',
      totalAmount: 'Total Amount',
    },
    settings: {
      storeSectionTitle: 'Store & Receipt Settings',
      storeSectionSubtitle: 'Configure your shop identity, Iraqi Dinar display, and thermal printer formatting.',
      shopNameLabel: 'Shop Name (English / Arabic)',
      currencyLabel: 'Currency Code',
      receiptWidthLabel: 'Thermal Receipt Width',
      thermalSuffix: 'Thermal',
      receiptLangLabel: 'Receipt Labels Language',
      langBilingual: 'Bilingual (English + العربية)',
      langEnglish: 'English (LTR)',
      langArabic: 'Arabic / العربية (RTL)',
      appLanguageLabel: 'App Interface Language',
      footerLabel: 'Receipt Footer Message',
      autoPrintLabel: 'Automatically open print dialog on checkout (F9)',
      saveSettingsBtn: 'Save Settings',
      savedToast: 'Shop and receipt settings saved locally.',
      backupTitle: 'Local Database Backup & Restore',
      backupSubtitle: "All products, sales history, and settings reside offline in your browser's IndexedDB.",
      productsCountLabel: 'products',
      salesCountLabel: 'completed sales',
      exportBtn: 'Export Backup (.JSON)',
      importBtn: 'Import Backup (.JSON)',
      importModeLabel: 'Import mode:',
      modeMerge: 'Merge (Keep Existing)',
      modeReplace: 'Replace All Data',
      livePreviewTitle: 'Live Receipt Layout Preview',
      replaceTitle: 'Replace Entire Database?',
      mergeTitle: 'Merge Backup Data?',
      replaceConfirmBtn: 'Replace Database',
      mergeConfirmBtn: 'Merge Backup',
      previewModalTitle: 'Receipt Print Preview',
      paperWidthLabel: 'Thermal Paper Width',
      printReceiptBtn: 'Print Receipt',
      preparingPrint: 'Preparing Print...',
    },
  },
  ar: {
    nav: {
      cashier: 'الكاشير',
      products: 'المنتجات',
      history: 'سجل المبيعات',
      settings: 'الإعدادات',
      pointOfSale: 'نقطة البيع',
      currencyLabel: 'العملة',
      receiptLabel: 'عرض الوصل',
      languageLabel: 'اللغة',
      installDesktopApp: 'تثبيت كتطبيق سطح مكتب',
      installApp: 'تثبيت التطبيق',
      offlineIndicator: 'وضع عدم الاتصال — قاعدة البيانات المحلية نشطة',
    },
    common: {
      cancel: 'إلغاء',
      save: 'حفظ',
      saving: 'جاري الحفظ...',
      close: 'إغلاق',
      delete: 'حذف',
      edit: 'تعديل',
      dismiss: 'إخفاء',
      confirm: 'تأكيد',
      all: 'الكل',
      search: 'بحث',
    },
    cashier: {
      scannerTitle: 'إدخال ماسح الباركود',
      scannerHint: 'جاهز للماسح الضوئي (USB / Bluetooth) · اضغط Enter أو F2 للتركيز',
      scannerPlaceholder: 'امسح باركود المنتج أو اكتبه يدوياً...',
      addBarcodeBtn: 'إضافة الباركود',
      quickSearchPlaceholder: 'بحث سريع عن منتج بالاسم أو الفئة...',
      activeCartTitle: 'سلة التسوق الحالية',
      itemSingular: 'منتج',
      itemPlural: 'منتجات',
      clearCart: 'إفراغ السلة',
      readyTitle: 'جاهز للزبون التالي',
      readySubtitle: 'امسح باركود المنتج بالماسح الضوئي أو ابحث بالاسم أعلاه لبدء الفاتورة.',
      lastSalePrefix: 'آخر فاتورة',
      reprintReceipt: 'إعادة طباعة الوصل',
      colProduct: 'المنتج',
      colUnitPrice: 'سعر الوحدة',
      colQty: 'الكمية',
      colSubtotal: 'المجموع الفرعي',
      checkoutSummary: 'ملخص الدفع',
      thermalFormat: 'مقاس الوصل الحراري',
      totalUnits: 'إجمالي القطع',
      distinctProducts: 'عدد الأصناف',
      subtotal: 'المجموع الفرعي',
      finalTotal: 'المجموع النهائي',
      processingSale: 'جاري الحفظ...',
      checkoutAndPrintBtn: 'طباعة الوصل / إتمام البيع',
      saveWithoutPrint: 'حفظ بدون طباعة',
      previewReceipt: 'معاينة الوصل',
      shortcutHint: 'اختصار: اضغط F9 لإتمام البيع',
      registerProductBtn: 'تسجيل المنتج',
      printFailedTitle: 'تعذرت طباعة الوصل رقم #{receiptNumber} — تم الاحتفاظ بالسلة',
      printFailedSubtitle: 'تم حفظ الفاتورة محلياً.',
      retryPrintBtn: 'إعادة الطباعة وإفراغ السلة',
      clearCartOnlyBtn: 'إفراغ السلة فقط',
      clearCartModalTitle: 'إفراغ سلة التسوق؟',
      clearCartModalMsg: 'سيتم حذف جميع المنتجات الممسوحة من السلة الحالية. لن تتأثر الفواتير المكتملة في السجل.',
      addedMsg: 'تمت إضافة {name} ({price})',
      unknownBarcodeMsg: 'الباركود "{barcode}" غير مسجل في قائمة المنتجات.',
      registeredAndAddedMsg: 'تم تسجيل "{name}" وإضافته إلى السلة.',
      saleSavedMsg: 'تم حفظ الفاتورة #{receiptNumber} ({total}).',
      salePrintedMsg: 'تم إتمام وطباعة الفاتورة #{receiptNumber}.',
      receiptPrintedClearedMsg: 'تمت طباعة الوصل #{receiptNumber} وإفراغ السلة.',
      editPriceTitle: 'انقر لتعديل سعر الوحدة',
    },
    products: {
      searchPlaceholder: 'ابحث باسم المنتج أو الباركود أو الفئة...',
      countSummary: '{filtered} من أصل {total} منتج',
      loadSamplesBtn: 'إضافة منتجات تجريبية',
      addProductBtn: 'إضافة منتج',
      emptyTitle: 'لا توجد منتجات مسجلة بعد',
      noMatchTitle: 'لا توجد منتجات مطابقة',
      emptySubtitle: 'أضف أول منتج تجميل يدوياً أو قم بتحميل منتجات تجريبية لاختبار المسح والدفع.',
      noMatchSubtitle: 'جرّب مسح نص البحث أو تغيير الفئة المحددة.',
      addFirstBtn: 'إضافة أول منتج',
      loadCatalogBtn: 'تحميل القائمة التجريبية',
      colProduct: 'المنتج',
      colBarcode: 'الباركود',
      colCategory: 'الفئة',
      colPrice: 'سعر البيع',
      colUpdated: 'آخر تحديث',
      colActions: 'إجراءات',
      editModalTitle: 'تعديل المنتج',
      addModalTitle: 'تسجيل منتج جديد',
      barcodeLabel: 'الباركود',
      barcodePlaceholder: 'امسح الباركود أو اكتبه يدوياً',
      generateBtn: 'توليد',
      barcodeHint: 'امسح بالماسح الضوئي أو ولّد باركود خاص بالمتجر.',
      nameLabel: 'اسم المنتج (عربي / إنجليزي)',
      namePlaceholder: 'مثال: سيروم فيتامين سي للوجه 30 مل',
      priceLabel: 'سعر البيع (دينار عراقي)',
      priceHint: 'اكتب رقمين لإضافة ثلاثة أصفار تلقائياً (مثال: 15 ← 15,000)، ثم أضف 250 / 500 / 750.',
      categoryLabel: 'الفئة',
      customCategoryOption: '+ فئة جديدة',
      customCategoryLabel: 'اسم الفئة الجديدة',
      customCategoryPlaceholder: 'أدخل اسم الفئة',
      imageLabel: 'صورة المنتج (اختياري)',
      uploadImageBtn: 'رفع صورة',
      replaceImageBtn: 'تغيير الصورة',
      removeImageBtn: 'إزالة',
      saveChangesBtn: 'حفظ التعديلات',
      saveProductBtn: 'حفظ المنتج',
      deleteTitle: 'حذف المنتج؟',
      deleteMsgPrefix: 'سيتم حذف "{name}" نهائياً من قائمة المنتجات.',
      deleteMsgSuffix: 'ستحتفظ الفواتير السابقة بأسماء وأسعار المنتجات كما بيعت وقتها.',
      deleteConfirmBtn: 'حذف المنتج',
      updatedToast: 'تم تحديث "{name}".',
      addedToast: 'تمت إضافة "{name}" إلى المنتجات.',
      deletedToast: 'تم حذف "{name}".',
      samplesLoadedToast: 'تمت إضافة {count} منتجات تجريبية إلى قاعدة البيانات المحلية.',
      samplesExistToast: 'المنتجات التجريبية موجودة بالفعل.',
      clickToAdd: 'انقر على البطاقة للإضافة إلى الكاشير',
    },
    history: {
      filteredTotal: 'إجمالي المبيعات المحددة',
      todayTotal: 'مبيعات اليوم',
      receiptsIssued: 'عدد الفواتير',
      averageBasket: 'متوسط الفاتورة',
      presetToday: 'اليوم',
      presetYesterday: 'أمس',
      presetWeek: 'آخر 7 أيام',
      presetAll: 'الكل',
      presetCustom: 'تاريخ محدد',
      searchPlaceholder: 'ابحث برقم الوصل أو اسم المنتج...',
      emptyTitle: 'لا توجد مبيعات في هذه الفترة',
      emptySubtitle: 'ستظهر الفواتير المكتملة من شاشة الكاشير هنا مع تفاصيل المنتجات.',
      colReceiptNo: 'رقم الوصل',
      colDateTime: 'التاريخ والوقت',
      colItems: 'المنتجات',
      colTotal: 'المبلغ الإجمالي',
      colActions: 'إجراءات',
      unitSingular: 'قطعة',
      unitPlural: 'قطع',
      moreSuffix: 'أخرى',
      detailsBtn: 'التفاصيل',
      reprintBtn: 'إعادة طباعة',
      receiptTitlePrefix: 'وصل رقم',
      colProductSnapshot: 'المنتج (نسخة الفاتورة)',
      colUnitPrice: 'سعر الوحدة',
      colQty: 'الكمية',
      colSubtotal: 'المجموع',
      totalAmount: 'المبلغ الإجمالي',
    },
    settings: {
      storeSectionTitle: 'إعدادات المتجر والوصل',
      storeSectionSubtitle: 'تخصيص اسم المتجر والعملة ومقاس الطابعة الحرارية ولغة التطبيق.',
      shopNameLabel: 'اسم المتجر (عربي / إنجليزي)',
      currencyLabel: 'رمز العملة',
      receiptWidthLabel: 'عرض ورق الطابعة الحرارية',
      thermalSuffix: 'حراري',
      receiptLangLabel: 'لغة طباعة الوصل',
      langBilingual: 'ثنائي اللغة (العربية + English)',
      langEnglish: 'الإنجليزية فقط (LTR)',
      langArabic: 'العربية فقط (RTL)',
      appLanguageLabel: 'لغة واجهة التطبيق',
      footerLabel: 'رسالة أسفل الوصل',
      autoPrintLabel: 'فتح نافذة الطباعة تلقائياً عند إتمام البيع (F9)',
      saveSettingsBtn: 'حفظ الإعدادات',
      savedToast: 'تم حفظ إعدادات المتجر والوصل محلياً.',
      backupTitle: 'النسخ الاحتياطي والاستعادة (محلي)',
      backupSubtitle: 'تُحفظ جميع المنتجات والمبيعات والإعدادات محلياً في المتصفح بدون إنترنت.',
      productsCountLabel: 'منتج',
      salesCountLabel: 'فاتورة مكتملة',
      exportBtn: 'تصدير نسخة احتياطية (.JSON)',
      importBtn: 'استعادة نسخة احتياطية (.JSON)',
      importModeLabel: 'وضع الاستعادة:',
      modeMerge: 'دمج (الاحتفاظ بالحالي)',
      modeReplace: 'استبدال كافة البيانات',
      livePreviewTitle: 'معاينة شكل الوصل مباشرة',
      replaceTitle: 'استبدال قاعدة البيانات بالكامل؟',
      mergeTitle: 'دمج النسخة الاحتياطية؟',
      replaceConfirmBtn: 'استبدال البيانات',
      mergeConfirmBtn: 'دمج البيانات',
      previewModalTitle: 'معاينة طباعة الوصل',
      paperWidthLabel: 'مقاس الورق الحراري',
      printReceiptBtn: 'طباعة الوصل',
      preparingPrint: 'جاري تجهيز الطباعة...',
    },
  },
};

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (acc, [key, val]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val)),
    template
  );
}
