import type { ReceiptData, ReceiptWidth } from '../types/pos';

export interface ReceiptPrintAdapter {
  print(receipt: ReceiptData): Promise<void>;
}

/**
 * Browser print adapter using window.print() and dynamic @page sizing for 58mm / 80mm thermal printers.
 * Designed behind an adapter interface so Electron (webContents.print) or Tauri (ESC/POS)
 * drivers can replace this implementation without changing UI components.
 */
class BrowserPrintAdapter implements ReceiptPrintAdapter {
  private setPageStyle(width: ReceiptWidth): HTMLStyleElement {
    const existing = document.getElementById('pos-dynamic-page-style');
    if (existing) existing.remove();

    const style = document.createElement('style');
    style.id = 'pos-dynamic-page-style';
    const paperWidth = width === '58mm' ? '58mm' : '80mm';
    style.textContent = `
      @media print {
        @page {
          size: ${paperWidth} auto;
          margin: 2mm;
        }
      }
    `;
    document.head.appendChild(style);
    return style;
  }

  async print(receipt: ReceiptData): Promise<void> {
    if (typeof window === 'undefined' || typeof window.print !== 'function') {
      throw new Error('Printing is not supported in this environment.');
    }

    this.setPageStyle(receipt.settings.receiptWidth);

    // Allow React one animation frame to paint #receipt-print-root before invoking print
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });

    return new Promise<void>((resolve, reject) => {
      try {
        let settled = false;
        const cleanup = () => {
          if (settled) return;
          settled = true;
          window.removeEventListener('afterprint', onAfterPrint);
          resolve();
        };

        const onAfterPrint = () => cleanup();
        window.addEventListener('afterprint', onAfterPrint, { once: true });

        window.print();

        // Fallback resolve in environments where afterprint does not fire synchronously
        setTimeout(() => cleanup(), 500);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Failed to trigger browser print dialog.'));
      }
    });
  }
}

export const printService: ReceiptPrintAdapter = new BrowserPrintAdapter();
