import type { AppLanguage } from '../types/pos';

export interface Translations {
  // Login & Staff
  login: {
    title: string;
    subtitle: string;
    choiceBadge: string;
    selectToStart: string;
    editName: string;
    saveName: string;
    switchCashier: string;
    activeCashierLabel: string;
  };
  // Navigation & Shell
  nav: {
    cashier: string;
    products: string;
    history: string;
    settings: string;
    statistics: string;
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
    optional: string;
    reset: string;
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
    discountLabel: string;
    finalTotal: string;
    tapFinalTotalHint: string;
    privateInsightsTitle: string;
    privateOnlyNotice: string;
    totalBuyingPay: string;
    totalSellingPrice: string;
    netProfitGetting: string;
    editFinalTotalLabel: string;
    resetToSubtotal: string;
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
    quickItemBtn: string;
    sellWithoutSavingBtn: string;
    quickItemModalTitle: string;
    quickItemModalSubtitle: string;
    quickItemNameLabel: string;
    quickItemNamePlaceholder: string;
    quickItemDefaultName: string;
    quickItemPriceLabel: string;
    quickItemQtyLabel: string;
    quickItemAddBtn: string;
    unregisteredLabel: string;
    lowStockHeaderBadge: string;
    lowStockHeaderTitle: string;
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
    buyingPriceLabel: string;
    stockLabel: string;
    stockPlaceholder: string;
    reorderPointLabel: string;
    reorderPointPlaceholder: string;
    reorderPointHint: string;
    stockBadge: string;
    lowStockBadge: string;
    outOfStockBadge: string;
    lowStockFilterBtn: string;
    lowStockAlertTitle: string;
    lowStockAlertAllBtn: string;
    lowStockAlertFilterBtn: string;
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
    colSoldBy: string;
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
    discountApplied: string;
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
    staffSectionTitle: string;
    staffSectionSubtitle: string;
    staffChoiceLabel: string;
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
  // Statistics Page
  stats: {
    presetToday: string;
    presetYesterday: string;
    presetWeek: string;
    presetMonth: string;
    presetAll: string;
    presetCustom: string;
    moneyInLabel: string;
    moneyInSub: string;
    moneyOutLabel: string;
    moneyOutSub: string;
    finalNetLabel: string;
    finalNetSub: string;
    discountsGivenLabel: string;
    costOfGoodsLabel: string;
    expensesTotalLabel: string;
    inventoryCostValue: string;
    inventoryRetailValue: string;
    lowStockCount: string;
    addExpenseTitle: string;
    expenseTitleLabel: string;
    expenseTitlePlaceholder: string;
    expenseAmountLabel: string;
    expenseCategoryLabel: string;
    expenseDateLabel: string;
    expenseNoteLabel: string;
    expenseAddBtn: string;
    expenseAddedToast: string;
    expenseDeletedToast: string;
    expensesListTitle: string;
    noExpenses: string;
    deleteExpenseTitle: string;
    deleteExpenseMsg: string;
    mostSellingTitle: string;
    leastSellingTitle: string;
    noSalesData: string;
    colProduct: string;
    colSoldQty: string;
    colRevenue: string;
    colProfit: string;
    colStock: string;
    staffPerformanceTitle: string;
    colCashier: string;
    colReceipts: string;
    categoryPerformanceTitle: string;
    colCategory: string;
    lowStockWatchlistTitle: string;
    noLowStock: string;
    notTracked: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  en: {
    login: {
      title: 'Select Cashier Profile',
      subtitle: 'Choose your profile to start selling. No password required.',
      choiceBadge: 'Choice',
      selectToStart: 'Click to Start',
      editName: 'Edit Name',
      saveName: 'Save',
      switchCashier: 'Switch Cashier',
      activeCashierLabel: 'Logged in as',
    },
    nav: {
      cashier: 'Cashier',
      products: 'Products',
      history: 'Sales History',
      settings: 'Settings',
      statistics: 'Statistics',
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
      optional: 'Optional',
      reset: 'Reset',
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
      discountLabel: 'Discount',
      finalTotal: 'Final Total',
      tapFinalTotalHint: 'Click for profit & discount',
      privateInsightsTitle: 'Private Cost & Discount (Not Printed)',
      privateOnlyNotice: 'Visible only to you — hidden from printed receipt',
      totalBuyingPay: 'Total Buying Cost',
      totalSellingPrice: 'Total Selling Price',
      netProfitGetting: 'Net Profit (You Get)',
      editFinalTotalLabel: 'Edit Final Total (Discount)',
      resetToSubtotal: 'Reset',
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
      quickItemBtn: 'Quick / Unregistered Item',
      sellWithoutSavingBtn: 'Sell Without Saving',
      quickItemModalTitle: 'Sell Unregistered Item',
      quickItemModalSubtitle: 'Add any item directly to this receipt without registering it in the catalog.',
      quickItemNameLabel: 'Item Name',
      quickItemNamePlaceholder: 'e.g. Lipstick, Cream, Gift Bag',
      quickItemDefaultName: 'Quick Sale Item',
      quickItemPriceLabel: 'Selling Price (IQD)',
      quickItemQtyLabel: 'Quantity',
      quickItemAddBtn: 'Add to Cart',
      unregisteredLabel: 'Unregistered item',
      lowStockHeaderBadge: 'Low Stock: {count}',
      lowStockHeaderTitle: 'Click to view products below reorder point',
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
      buyingPriceLabel: 'Buying Price (IQD)',
      stockLabel: 'Stock Quantity',
      stockPlaceholder: 'e.g. 20',
      reorderPointLabel: 'Reorder Point',
      reorderPointPlaceholder: 'Default: 5',
      reorderPointHint: 'Alert appears when stock falls below this number.',
      stockBadge: 'Stock',
      lowStockBadge: 'Low',
      outOfStockBadge: 'Out of stock',
      lowStockFilterBtn: 'Low Stock ({count})',
      lowStockAlertTitle: '{count} product(s) below reorder point',
      lowStockAlertAllBtn: 'Show All',
      lowStockAlertFilterBtn: 'View Low Stock',
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
      searchPlaceholder: 'Search receipt #, product, or cashier...',
      emptyTitle: 'No sales found for this period',
      emptySubtitle: 'Completed transactions from the Cashier screen will appear here with immutable item snapshots.',
      colReceiptNo: 'Receipt No',
      colDateTime: 'Date & Time',
      colSoldBy: 'Sold By',
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
      discountApplied: 'Discount Applied',
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
      staffSectionTitle: 'Cashier Profiles (Login Choices 1, 2, 3)',
      staffSectionSubtitle: 'Customize the 3 cashier names shown on the login screen and sales records.',
      staffChoiceLabel: 'Choice',
      saveSettingsBtn: 'Save Settings',
      savedToast: 'Shop, cashier profiles, and receipt settings saved locally.',
      backupTitle: 'Local Database Backup & Restore',
      backupSubtitle: "All products, sales, expenses, and settings reside offline in your browser's IndexedDB.",
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
    stats: {
      presetToday: 'Today',
      presetYesterday: 'Yesterday',
      presetWeek: 'Last 7 Days',
      presetMonth: 'Last 30 Days',
      presetAll: 'All Time',
      presetCustom: 'Pick Date',
      moneyInLabel: 'Money Coming In (Sales)',
      moneyInSub: '{count} completed receipts',
      moneyOutLabel: 'Money Out (Cost + Expenses)',
      moneyOutSub: 'Buying cost + recorded expenses',
      finalNetLabel: 'Final Net Money',
      finalNetSub: 'Sales minus buying cost & expenses',
      discountsGivenLabel: 'Discounts Given',
      costOfGoodsLabel: 'Product Buying Cost',
      expensesTotalLabel: 'Shop Expenses',
      inventoryCostValue: 'Stock Cost Value',
      inventoryRetailValue: 'Stock Retail Value',
      lowStockCount: 'Low / Out of Stock',
      addExpenseTitle: 'Add New Expense',
      expenseTitleLabel: 'Expense Title',
      expenseTitlePlaceholder: 'e.g. Shop Rent, Delivery, Packaging',
      expenseAmountLabel: 'Amount (IQD)',
      expenseCategoryLabel: 'Category',
      expenseDateLabel: 'Date',
      expenseNoteLabel: 'Note (Optional)',
      expenseAddBtn: 'Add Expense',
      expenseAddedToast: 'Expense "{title}" saved.',
      expenseDeletedToast: 'Expense deleted.',
      expensesListTitle: 'Recorded Expenses',
      noExpenses: 'No expenses recorded in this period.',
      deleteExpenseTitle: 'Delete Expense?',
      deleteExpenseMsg: '"{title}" will be removed from your local expense records.',
      mostSellingTitle: 'Most Selling Products',
      leastSellingTitle: 'Least Selling Products',
      noSalesData: 'No sales recorded yet for this period.',
      colProduct: 'Product',
      colSoldQty: 'Units Sold',
      colRevenue: 'Revenue',
      colProfit: 'Profit',
      colStock: 'Stock',
      staffPerformanceTitle: 'Sales by Cashier (1 / 2 / 3)',
      colCashier: 'Cashier',
      colReceipts: 'Receipts',
      categoryPerformanceTitle: 'Sales by Category',
      colCategory: 'Category',
      lowStockWatchlistTitle: 'Stock Watchlist (≤ 5 units)',
      noLowStock: 'All tracked products have healthy stock levels.',
      notTracked: 'Not tracked',
    },
  },
  ar: {
    login: {
      title: 'اختر حساب الكاشير',
      subtitle: 'اختر رقمك للبدء بالبيع مباشرة. لا يتطلب كلمة مرور.',
      choiceBadge: 'اختيار',
      selectToStart: 'اضغط للدخول',
      editName: 'تعديل الاسم',
      saveName: 'حفظ',
      switchCashier: 'تبديل الكاشير',
      activeCashierLabel: 'مسجل الدخول',
    },
    nav: {
      cashier: 'الكاشير',
      products: 'المنتجات',
      history: 'سجل المبيعات',
      settings: 'الإعدادات',
      statistics: 'الإحصائيات',
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
      optional: 'اختياري',
      reset: 'إرجاع',
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
      discountLabel: 'الخصم',
      finalTotal: 'المجموع النهائي',
      tapFinalTotalHint: 'اضغط للربح والخصم',
      privateInsightsTitle: 'تفاصيل الشراء والخصم (لا يُطبع في الوصل)',
      privateOnlyNotice: 'مرئي لك فقط — مخفي عن الوصل المطبوع',
      totalBuyingPay: 'إجمالي سعر الشراء (رأس المال)',
      totalSellingPrice: 'إجمالي سعر البيع',
      netProfitGetting: 'صافي الربح الذي ستحصل عليه',
      editFinalTotalLabel: 'تعديل السعر النهائي (تخفيض / خصم)',
      resetToSubtotal: 'إرجاع',
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
      quickItemBtn: 'بيع منتج سريع (غير مسجل)',
      sellWithoutSavingBtn: 'بيع بدون تسجيل',
      quickItemModalTitle: 'بيع منتج غير مسجل',
      quickItemModalSubtitle: 'أضف أي منتج مباشرة إلى هذه الفاتورة بدون الحاجة لتسجيله في قائمة المنتجات.',
      quickItemNameLabel: 'اسم المنتج',
      quickItemNamePlaceholder: 'مثال: أحمر شفاه، كريم، علبة هدايا',
      quickItemDefaultName: 'منتج بيع سريع',
      quickItemPriceLabel: 'سعر البيع (دينار عراقي)',
      quickItemQtyLabel: 'الكمية',
      quickItemAddBtn: 'إضافة إلى السلة',
      unregisteredLabel: 'منتج غير مسجل',
      lowStockHeaderBadge: 'نقص مخزون: {count}',
      lowStockHeaderTitle: 'اضغط لعرض المنتجات التي انخفضت عن حد إعادة الطلب',
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
      buyingPriceLabel: 'سعر الشراء (دينار عراقي)',
      stockLabel: 'الكمية بالمخزن',
      stockPlaceholder: 'مثال: 20',
      reorderPointLabel: 'حد التنبيه (إعادة الطلب)',
      reorderPointPlaceholder: 'الافتراضي: 5',
      reorderPointHint: 'يظهر تنبيه عندما يقل المخزون عن هذا الرقم.',
      stockBadge: 'المخزون',
      lowStockBadge: 'منخفض',
      outOfStockBadge: 'نفذت الكمية',
      lowStockFilterBtn: 'نقص المخزون ({count})',
      lowStockAlertTitle: '{count} منتج أقل من حد إعادة الطلب',
      lowStockAlertAllBtn: 'عرض الكل',
      lowStockAlertFilterBtn: 'عرض الناقص فقط',
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
      searchPlaceholder: 'ابحث برقم الوصل أو المنتج أو الكاشير...',
      emptyTitle: 'لا توجد مبيعات في هذه الفترة',
      emptySubtitle: 'ستظهر الفواتير المكتملة من شاشة الكاشير هنا مع تفاصيل المنتجات.',
      colReceiptNo: 'رقم الوصل',
      colDateTime: 'التاريخ والوقت',
      colSoldBy: 'البائع',
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
      discountApplied: 'الخصم المطبق',
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
      staffSectionTitle: 'حسابات الكاشير (الخيارات 1 و 2 و 3)',
      staffSectionSubtitle: 'تعديل أسماء الموظفين الثلاثة الظاهرة في صفحة الدخول وسجل المبيعات.',
      staffChoiceLabel: 'خيار',
      saveSettingsBtn: 'حفظ الإعدادات',
      savedToast: 'تم حفظ إعدادات المتجر وحسابات الكاشير محلياً.',
      backupTitle: 'النسخ الاحتياطي والاستعادة (محلي)',
      backupSubtitle: 'تُحفظ جميع المنتجات والمبيعات والمصاريف والإعدادات محلياً بدون إنترنت.',
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
    stats: {
      presetToday: 'اليوم',
      presetYesterday: 'أمس',
      presetWeek: 'آخر 7 أيام',
      presetMonth: 'آخر 30 يوماً',
      presetAll: 'الكل',
      presetCustom: 'تاريخ محدد',
      moneyInLabel: 'الأموال الداخلة (المبيعات)',
      moneyInSub: '{count} فاتورة مكتملة',
      moneyOutLabel: 'الأموال الخارجة (التكلفة + المصاريف)',
      moneyOutSub: 'تكلفة الشراء + المصاريف المسجلة',
      finalNetLabel: 'صافي الربح النهائي',
      finalNetSub: 'المبيعات ناقص تكلفة الشراء والمصاريف',
      discountsGivenLabel: 'الخصومات الممنوحة',
      costOfGoodsLabel: 'تكلفة شراء البضاعة',
      expensesTotalLabel: 'مصاريف المتجر',
      inventoryCostValue: 'قيمة المخزون (شراء)',
      inventoryRetailValue: 'قيمة المخزون (بيع)',
      lowStockCount: 'مخزون منخفض / منتهي',
      addExpenseTitle: 'إضافة مصروف جديد',
      expenseTitleLabel: 'عنوان المصروف',
      expenseTitlePlaceholder: 'مثال: إيجار، توصيل، تغليف، فواتير',
      expenseAmountLabel: 'المبلغ (دينار عراقي)',
      expenseCategoryLabel: 'الفئة',
      expenseDateLabel: 'التاريخ',
      expenseNoteLabel: 'ملاحظة (اختياري)',
      expenseAddBtn: 'إضافة المصروف',
      expenseAddedToast: 'تم حفظ المصروف "{title}".',
      expenseDeletedToast: 'تم حذف المصروف.',
      expensesListTitle: 'المصاريف المسجلة',
      noExpenses: 'لا توجد مصاريف مسجلة في هذه الفترة.',
      deleteExpenseTitle: 'حذف المصروف؟',
      deleteExpenseMsg: 'سيتم حذف "{title}" من سجل المصاريف المحلي.',
      mostSellingTitle: 'المنتجات الأكثر مبيعاً',
      leastSellingTitle: 'المنتجات الأقل مبيعاً',
      noSalesData: 'لا توجد مبيعات مسجلة في هذه الفترة بعد.',
      colProduct: 'المنتج',
      colSoldQty: 'الكمية المباعة',
      colRevenue: 'الإيرادات',
      colProfit: 'الربح',
      colStock: 'المخزون',
      staffPerformanceTitle: 'المبيعات حسب الكاشير (1 / 2 / 3)',
      colCashier: 'الكاشير',
      colReceipts: 'الفواتير',
      categoryPerformanceTitle: 'المبيعات حسب الفئة',
      colCategory: 'الفئة',
      lowStockWatchlistTitle: 'تنبيهات المخزون (5 قطع أو أقل)',
      noLowStock: 'جميع المنتجات المتتبعة متوفرة بكميات جيدة.',
      notTracked: 'غير متتبع',
    },
  },
};

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (acc, [key, val]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val)),
    template
  );
}
