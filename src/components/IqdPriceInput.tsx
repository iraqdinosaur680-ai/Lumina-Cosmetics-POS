import React, { useEffect, useRef, useState } from 'react';
import { formatNumber, normalizeDigits } from '../utils/formatters';

export const IQD_FRACTIONS = [250, 500, 750] as const;

interface IqdPriceInputProps {
  id?: string;
  value: number | null;
  onChange: (nextValue: number | null) => void;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  compact?: boolean;
  autoFocus?: boolean;
  selectAllOnFocus?: boolean;
  onEnter?: () => void;
  onEscape?: () => void;
}

/**
 * Specialized Iraqi Dinar (IQD) price input:
 * - Typing 2 digits automatically appends three zeros (e.g. "15" -> "15,000", "01" -> "1,000").
 * - Cursor stays right before ",000" so typing a 3rd digit seamlessly becomes "150,000".
 * - Provides 250 / 500 / 750 quick-choice buttons that set the sub-thousand remainder
 *   (e.g. 1,000 + 500 -> 1,500; 15,000 + 750 -> 15,750).
 */
export const IqdPriceInput: React.FC<IqdPriceInputProps> = ({
  id,
  value,
  onChange,
  placeholder = '15,000',
  inputRef: externalRef,
  compact = false,
  autoFocus = false,
  selectAllOnFocus = false,
  onEnter,
  onEscape,
}) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const resolvedRef = externalRef ?? internalRef;

  const [displayText, setDisplayText] = useState<string>(() =>
    value !== null && value > 0 ? formatNumber(value) : value === 0 ? '0' : ''
  );

  // Tracks whether the current input session has already auto-expanded 2 digits -> ,000
  const hasAutoExpandedRef = useRef<boolean>(value !== null && value >= 1000);

  // Sync external value changes when not actively mid-single-digit typing
  useEffect(() => {
    if (value === null) {
      setDisplayText('');
      hasAutoExpandedRef.current = false;
      return;
    }
    const currentDigits = Number(normalizeDigits(displayText).replace(/[^\d]/g, '') || '0');
    if (currentDigits !== value || (value === 0 && displayText !== '0' && displayText !== '')) {
      setDisplayText(value > 0 ? formatNumber(value) : '0');
      if (value >= 1000) {
        hasAutoExpandedRef.current = true;
      }
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus) {
      requestAnimationFrame(() => {
        resolvedRef.current?.focus();
        if (selectAllOnFocus) {
          resolvedRef.current?.select();
        }
      });
    }
  }, [autoFocus, selectAllOnFocus, resolvedRef]);

  const setFormattedWithCursor = (formatted: string, cursorPos: number) => {
    setDisplayText(formatted);
    requestAnimationFrame(() => {
      const el = resolvedRef.current;
      if (el && document.activeElement === el) {
        el.setSelectionRange(cursorPos, cursorPos);
      }
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = normalizeDigits(e.target.value);
    const digitsOnly = raw.replace(/[^\d]/g, '');

    if (digitsOnly === '') {
      hasAutoExpandedRef.current = false;
      setDisplayText('');
      onChange(null);
      return;
    }

    // Auto-expand when user types exactly 2 digits fresh (not yet expanded)
    if (!hasAutoExpandedRef.current && digitsOnly.length === 2) {
      const baseThousands = parseInt(digitsOnly, 10);
      if (baseThousands > 0) {
        const expanded = baseThousands * 1000;
        hasAutoExpandedRef.current = true;
        const formatted = formatNumber(expanded);
        // Place cursor right before ",000" so user can keep typing for 3-digit thousands if desired
        const commaIdx = formatted.indexOf(',');
        const cursorPos = commaIdx !== -1 ? commaIdx : formatted.length;
        setFormattedWithCursor(formatted, cursorPos);
        onChange(expanded);
        return;
      }
    }

    const numeric = parseInt(digitsOnly, 10);
    if (digitsOnly.length >= 3) {
      hasAutoExpandedRef.current = true;
    } else if (digitsOnly.length <= 1) {
      hasAutoExpandedRef.current = false;
    }

    const formatted = formatNumber(numeric);
    setDisplayText(formatted);
    onChange(numeric);
  };

  const handleApplyFraction = (fraction: 250 | 500 | 750) => {
    const current = value ?? 0;

    // If user typed 1 digit (e.g. "1" or "5") and immediately picks 500 -> treat as 1,500 / 5,500
    if (
      current > 0 &&
      current < 1000 &&
      current !== 250 &&
      current !== 500 &&
      current !== 750
    ) {
      const next = current * 1000 + fraction;
      hasAutoExpandedRef.current = true;
      setDisplayText(formatNumber(next));
      onChange(next);
      return;
    }

    const thousandsPart = Math.floor(current / 1000) * 1000;
    const currentFraction = current % 1000;

    // Clicking the already active fraction toggles it back to clean thousands
    const next = currentFraction === fraction ? thousandsPart : thousandsPart + fraction;
    hasAutoExpandedRef.current = next >= 1000;
    setDisplayText(next > 0 ? formatNumber(next) : '0');
    onChange(next);
  };

  const activeFraction = value !== null ? value % 1000 : 0;

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <input
        ref={resolvedRef}
        id={id}
        type="text"
        inputMode="numeric"
        dir="ltr"
        value={displayText}
        onChange={handleTextChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (onEnter) {
              e.preventDefault();
              onEnter();
            }
          } else if (e.key === 'Escape') {
            if (onEscape) {
              e.preventDefault();
              onEscape();
            }
          }
        }}
        placeholder={placeholder}
        className={
          compact
            ? 'w-28 px-2.5 py-1 text-end text-xs font-mono font-semibold tabular-nums bg-white border border-[#9D174D] rounded-md focus:outline-none'
            : 'w-full px-3.5 py-2.5 text-sm font-mono font-semibold tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D174D]/20 focus:border-[#9D174D]'
        }
      />

      <div className="flex items-center gap-1.5" dir="ltr">
        {IQD_FRACTIONS.map((frac) => {
          const isActive = activeFraction === frac && (value ?? 0) > 0;
          return (
            <button
              key={frac}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleApplyFraction(frac)}
              className={`font-mono tabular-nums font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                compact ? 'px-2 py-0.5 text-[11px]' : 'flex-1 py-1.5 text-xs'
              } ${
                isActive
                  ? 'bg-[#9D174D] text-white border-[#9D174D]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              +{frac}
            </button>
          );
        })}
      </div>
    </div>
  );
};
