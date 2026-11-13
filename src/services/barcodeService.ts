import { normalizeDigits } from '../utils/formatters';

export function normalizeBarcodeInput(raw: string): string {
  return normalizeDigits(raw).replace(/\s+/g, '');
}

export function formatReceiptNumber(sequenceNumber: number): string {
  return String(Math.max(1, sequenceNumber)).padStart(6, '0');
}

/**
 * Simple duplicate-event guard for accidental double Enter / rapid hardware bounce
 * within a very tight window (e.g. 60ms) while still permitting consecutive scans
 * of the same item by the cashier.
 */
export class ScanDeduplicator {
  private lastBarcode = '';
  private lastTimestamp = 0;

  shouldIgnore(barcode: string, thresholdMs = 80): boolean {
    const now = performance.now();
    const isImmediateDuplicate =
      barcode === this.lastBarcode && now - this.lastTimestamp < thresholdMs;
    this.lastBarcode = barcode;
    this.lastTimestamp = now;
    return isImmediateDuplicate;
  }
}
