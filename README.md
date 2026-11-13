# Lumina Cosmetics POS

A **custom-built, 100% offline desktop Point of Sale (POS) web application** designed specifically for **cosmetics shops** (created for a customer request). Built with React, TypeScript, Vite, Tailwind CSS, and IndexedDB (Dexie.js), it runs completely locally with zero internet dependency, works seamlessly with **USB & Bluetooth barcode readers**, supports **English and Arabic (RTL)**, and is ready for **PWA installation** or desktop packaging with **Electron / Tauri**.

---

## Key Features

### Plug-and-Play Barcode Reader Support
- **Zero Drivers or SDKs Required**: Works out of the box with any standard **USB or Bluetooth barcode scanner** operating in standard **HID keyboard-wedge mode** (ending scans with `Enter`).
- **Scan From Anywhere**: Scanning a barcode from any screen (Products, Sales History, or Settings) automatically adds the product to the active cart and switches directly to the **Cashier** screen—while safely ignoring scans when you are searching or editing a product in a modal.
- **Smart Input Normalization**: Automatically converts Arabic-Indic digits (`٠-٩`) to standard digits (`0-9`) so scanning works reliably regardless of active OS keyboard layout, and prevents accidental hardware double-fires.
- **Unknown Barcode Registration**: Scanning an unregistered barcode immediately prompts to register the item with the barcode pre-filled, then adds it straight into the active sale.

### Cashier & Fast Iraqi Dinar (IQD) Checkout
- **Desktop Split Workspace**: Auto-focused barcode bar, quick name/category search, full shopping cart table with quantity steppers, inline unit price editing, and a prominent **Final Total (IQD)** display.
- **Fast IQD Thousands Entry (`+250` / `+500` / `+750`)**: Typing two digits in any price field automatically appends `,000` (e.g., `15` → `15,000`), paired with one-click `+250`, `+500`, and `+750` buttons (e.g., `1,000` + `+500` → `1,500`; `15,000` + `+750` → `15,750`).
- **Print-Safe Checkout (`F9`)**: Saves completed sales and immutable product snapshots inside an atomic IndexedDB transaction. If printing fails, the cart is preserved with a one-click retry option.

### Cosmetics Product Catalog
- **Uniform Square-Card Grid**: Clean, aligned square product cards showing optional compressed images, category, name, IQD price, and barcode.
- **Multi-Item Hand Selection**: Clicking a product card adds it to the cart immediately without leaving the Products page, while the live cart counter updates in the sidebar.
- **Clear Product Controls**: Dedicated **Edit** and **Delete** buttons on every card, category filtering, live search, internal EAN-13 barcode generator, and optional sample cosmetics catalog loader.

### Thermal Receipt Printing (58mm & 80mm)
- **Thermal & Standard Printers**: Modular `ReceiptPrintAdapter` using `window.print()` and dynamic `@page` CSS sizing for **58mm** and **80mm** thermal printers—structured cleanly for future Electron or Tauri direct ESC/POS printing.
- **Bilingual Receipts**: Supports **English (LTR)**, **Arabic (RTL)**, and **Bilingual** receipt layouts with `dir="auto"` for mixed product names, live print preview, and receipt reprinting.

### Bilingual Interface, Sales History & Offline Backup
- **Instant Language Switching**: Switch the entire UI between **English (LTR)** and **Arabic / العربية (RTL)** from the header or Settings.
- **Sales History**: Filter transactions by Today, Yesterday, Last 7 Days, All Time, or Custom Date; calculate daily totals and average basket size; inspect immutable historical item snapshots; and reprint past receipts.
- **Local Backup & Restore**: Export the full IndexedDB database (products, sales, sale items, and settings) as a `.json` file and restore using Merge or Replace mode.
- **100% Offline PWA**: Fonts and icons are bundled locally with `vite-plugin-pwa` asset caching so the app loads and runs without internet access.

---

## Linking a Barcode Reader

1. Connect your **USB** barcode scanner (or pair your **Bluetooth** barcode scanner) to your Windows/macOS/Linux computer.
2. Ensure the scanner is in **HID Keyboard Mode** with an **Enter (`CR`/`LF`) suffix** enabled (this is the factory default for almost all retail barcode scanners).
3. Open **Lumina Cosmetics POS** in your browser or installed PWA/desktop window—no pairing wizard or driver installation is required inside the app.
4. Scan any item:
   - From the **Cashier** screen, the item is immediately added to the cart.
   - From **Products**, **Sales History**, or **Settings** (when not typing in a search box or editing dialog), scanning automatically adds the item and brings you straight to **Cashier**.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Routing**: React Router (`HashRouter` for seamless web, PWA, Electron `file://`, and Tauri compatibility)
- **Local Database**: IndexedDB via Dexie.js & `dexie-react-hooks`
- **Offline / PWA**: `vite-plugin-pwa` + locally bundled `@fontsource/plus-jakarta-sans` & `@fontsource/jetbrains-mono`

---

## Project Structure

```text
src/
├── components/   # Reusable UI modals, receipt preview, IQD price input, PWA controls
├── context/      # Shared POS cart & checkout state across routes
├── database/     # Dexie.js IndexedDB schema and transactional repositories
├── hooks/        # Clock, translation, online status, and PWA install hooks
├── i18n/         # Full English & Arabic (RTL) translation dictionary
├── layouts/      # Desktop sidebar shell, header clock, global barcode listener
├── pages/        # Cashier, Products, Sales History, and Settings pages
├── services/     # Barcode normalization/deduplication and modular print adapter
├── styles/       # Tailwind CSS setup and thermal 58mm/80mm print stylesheet
├── types/        # TypeScript domain interfaces
└── utils/        # IQD formatting, date helpers, barcode generator, image compression
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Install & Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your desktop browser.

### Type-Check & Production Build

```bash
npm run lint
npm run build
```

The production static bundle in `dist/` is completely self-contained and ready to host as an offline PWA or wrap inside **Electron** or **Tauri** as a standalone desktop application.
