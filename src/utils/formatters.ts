/**
 * Format numeric amounts for Iraqi Dinar (IQD) display.
 * IQD is typically displayed without decimals in retail POS.
 */
export function formatCurrency(amount: number, currency = 'IQD'): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(rounded) ? rounded : 0);
  return `${formatted} ${currency}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? Math.round(value) : 0);
}

/**
 * Format ISO date string as DD/MM/YYYY for receipts and tables.
 */
export function formatReceiptDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTime(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  const datePart = formatReceiptDate(isoDate);
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${datePart} ${hours}:${mins}`;
}

export function formatTimeWithSeconds(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  const secs = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${mins}:${secs}`;
}

/**
 * Detect whether a string contains Arabic characters for RTL/LTR receipt handling.
 */
export function containsArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

/**
 * Normalize Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) and Eastern Arabic digits (۰۱۲۳۴۵۶۷۸۹)
 * to standard ASCII digits (0-9) and strip control characters.
 */
export function normalizeDigits(input: string): string {
  const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
  const easternArabic = '۰۱۲۳۴۵۶۷۸۹';

  return input
    .replace(/[\u200B-\u200D\uFEFF\r\n\t]/g, '')
    .split('')
    .map((ch) => {
      const idx1 = arabicIndic.indexOf(ch);
      if (idx1 !== -1) return String(idx1);
      const idx2 = easternArabic.indexOf(ch);
      if (idx2 !== -1) return String(idx2);
      return ch;
    })
    .join('')
    .trim();
}

/**
 * Generate a valid EAN-13 internal barcode starting with prefix "20" (in-store retail prefix).
 */
export function generateInternalBarcode(): string {
  const randomTen = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
  const base12 = `20${randomTen}`;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = Number(base12[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return `${base12}${checkDigit}`;
}

/**
 * Compress and resize an uploaded product image completely offline using HTML5 Canvas
 * so IndexedDB storage remains fast and compact.
 */
export function compressImageFile(file: File, maxDimension = 320, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Selected file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const DEFAULT_COSMETIC_CATEGORIES = [
  'Skincare',
  'Makeup',
  'Fragrance',
  'Haircare',
  'Body Care',
  'Accessories',
  'Other',
];
