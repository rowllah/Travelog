/**
 * Build-time exchange rates (USD base). Pages render with these, then the browser
 * refreshes them live from open.er-api.com (see src/scripts/currency.ts).
 */
const STATIC_FALLBACK: Record<string, number> = {
  USD: 1, INR: 88, EUR: 0.92, GBP: 0.78, AED: 3.67, SGD: 1.34, AUD: 1.52, CAD: 1.37,
  THB: 34, VND: 26000, AZN: 1.7, EGP: 48, TRY: 41, MVR: 15.4, JPY: 150, LKR: 300, MYR: 4.4, IDR: 16000,
  NPR: 141, BDT: 122, PKR: 281, BTN: 88, MMK: 2100, SAR: 3.75, QAR: 3.64, OMR: 0.385, KWD: 0.307, BHD: 0.376,
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

export const CURRENCY_GROUPS: { label: string; currencies: [code: string, flag: string][] }[] = [
  { label: 'South Asia', currencies: [['INR', '🇮🇳'], ['NPR', '🇳🇵'], ['BDT', '🇧🇩'], ['LKR', '🇱🇰'], ['PKR', '🇵🇰'], ['BTN', '🇧🇹'], ['MVR', '🇲🇻']] },
  { label: 'Gulf', currencies: [['AED', '🇦🇪'], ['SAR', '🇸🇦'], ['QAR', '🇶🇦'], ['OMR', '🇴🇲'], ['KWD', '🇰🇼'], ['BHD', '🇧🇭']] },
  { label: 'Southeast & East Asia', currencies: [['SGD', '🇸🇬'], ['MYR', '🇲🇾'], ['THB', '🇹🇭'], ['IDR', '🇮🇩'], ['VND', '🇻🇳'], ['MMK', '🇲🇲'], ['JPY', '🇯🇵']] },
  { label: 'Europe & Middle East', currencies: [['EUR', '🇪🇺'], ['GBP', '🇬🇧'], ['TRY', '🇹🇷'], ['AZN', '🇦🇿'], ['EGP', '🇪🇬']] },
  { label: 'Americas & Oceania', currencies: [['USD', '🇺🇸'], ['CAD', '🇨🇦'], ['AUD', '🇦🇺']] },
];

export const CURRENCIES = CURRENCY_GROUPS.flatMap((g) => g.currencies.map(([code]) => code));

/** Visitor timezone → likely home currency, used until they pick one. */
export const TIMEZONE_CURRENCY: Record<string, string> = {
  'Asia/Kolkata': 'INR', 'Asia/Calcutta': 'INR', 'Asia/Kathmandu': 'NPR', 'Asia/Katmandu': 'NPR', 'Asia/Dhaka': 'BDT',
  'Asia/Colombo': 'LKR', 'Asia/Karachi': 'PKR', 'Asia/Thimphu': 'BTN', 'Indian/Maldives': 'MVR', 'Asia/Yangon': 'MMK',
  'Asia/Dubai': 'AED', 'Asia/Riyadh': 'SAR', 'Asia/Qatar': 'QAR', 'Asia/Muscat': 'OMR', 'Asia/Kuwait': 'KWD', 'Asia/Bahrain': 'BHD',
  'Asia/Singapore': 'SGD', 'Asia/Kuala_Lumpur': 'MYR', 'Asia/Bangkok': 'THB', 'Asia/Jakarta': 'IDR', 'Asia/Makassar': 'IDR',
  'Asia/Ho_Chi_Minh': 'VND', 'Asia/Saigon': 'VND', 'Asia/Tokyo': 'JPY', 'Europe/London': 'GBP', 'Europe/Istanbul': 'TRY',
  'Asia/Baku': 'AZN', 'Africa/Cairo': 'EGP', 'America/Toronto': 'CAD', 'America/Vancouver': 'CAD',
};

export function currencyForTimezone(tz: string) {
  if (TIMEZONE_CURRENCY[tz]) return TIMEZONE_CURRENCY[tz];
  if (tz.startsWith('Australia/')) return 'AUD';
  if (tz.startsWith('America/')) return 'USD';
  if (tz.startsWith('Europe/')) return 'EUR';
  return 'INR';
}

export function convert(amount: number, from: string, to: string, rates: Record<string, number>) {
  if (from === to) return amount;
  const f = rates[from], t = rates[to];
  if (!f || !t) return NaN;
  return (amount / f) * t;
}

export function formatMoney(amount: number, currency: string) {
  if (!isFinite(amount)) return '—';
  const locale = ['INR', 'NPR', 'BDT', 'PKR', 'BTN'].includes(currency) ? 'en-IN' : 'en-US';
  const digits = Math.abs(amount) >= 100 || ['VND', 'JPY', 'IDR', 'MMK'].includes(currency) ? 0 : 2;
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}
