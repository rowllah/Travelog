/**
 * Build-time exchange rates (USD base). Pages render with these, then the browser
 * refreshes them live from open.er-api.com (see src/scripts/currency.ts).
 */
const STATIC_FALLBACK: Record<string, number> = {
  USD: 1, INR: 88, EUR: 0.92, GBP: 0.78, AED: 3.67, SGD: 1.34, AUD: 1.52, CAD: 1.37,
  THB: 34, VND: 26000, AZN: 1.7, EGP: 48, TRY: 41, MVR: 15.4, JPY: 150, LKR: 300, MYR: 4.4, IDR: 16000,
};

let cache: Promise<{ rates: Record<string, number>; updated: string }> | undefined;

export function buildRates() {
  cache ??= (async () => {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(8000) });
      const json = await res.json();
      if (json.result === 'success') return { rates: json.rates as Record<string, number>, updated: json.time_last_update_utc as string };
    } catch {
      /* offline build — use static rates */
    }
    return { rates: STATIC_FALLBACK, updated: 'static fallback' };
  })();
  return cache;
}

export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'THB', 'VND', 'AZN', 'EGP', 'TRY', 'MVR', 'JPY'];

export function convert(amount: number, from: string, to: string, rates: Record<string, number>) {
  if (from === to) return amount;
  const f = rates[from], t = rates[to];
  if (!f || !t) return NaN;
  return (amount / f) * t;
}

export function formatMoney(amount: number, currency: string) {
  if (!isFinite(amount)) return '—';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  const digits = Math.abs(amount) >= 100 || ['VND', 'JPY', 'IDR'].includes(currency) ? 0 : 2;
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}
