import { convert, formatMoney } from '../lib/fx';

export { convert, formatMoney };

const CUR_KEY = 'travelog:currency';
const RATES_KEY = 'travelog:rates';
const MAX_AGE = 6 * 60 * 60 * 1000;

type RateState = { rates: Record<string, number>; updated: string; live: boolean };

let state: RateState | undefined;

function fallback(): RateState {
  const el = document.getElementById('fx-fallback');
  const data = el ? JSON.parse(el.textContent || '{}') : { rates: { USD: 1, INR: 88 }, updated: '' };
  return { ...data, live: false };
}

export function getCurrency() {
  return localStorage.getItem(CUR_KEY) || 'INR';
}

export function setCurrency(cur: string) {
  localStorage.setItem(CUR_KEY, cur);
  window.dispatchEvent(new CustomEvent('currencychange', { detail: cur }));
}

export function rates(): RateState {
  if (state) return state;
  try {
    const cached = JSON.parse(localStorage.getItem(RATES_KEY) || 'null');
    if (cached?.rates) state = { ...cached, live: Date.now() - cached.at < MAX_AGE };
  } catch {
    /* ignore */
  }
  return (state ??= fallback());
}

export async function refreshRates() {
  const current = rates();
  if (current.live) return current;
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const json = await res.json();
    if (json.result === 'success') {
      state = { rates: json.rates, updated: json.time_last_update_utc, live: true };
      localStorage.setItem(RATES_KEY, JSON.stringify({ ...state, at: Date.now() }));
      window.dispatchEvent(new CustomEvent('rateschange'));
    }
  } catch {
    /* keep fallback */
  }
  return rates();
}

export function toSelected(amount: number, from: string) {
  return convert(amount, from, getCurrency(), rates().rates);
}

/**
 * Renders every `.money` element in the selected currency.
 *  - data-amt + data-cur (+ optional data-max) for single values / ranges
 *  - data-sum='[[amount,"CUR"], ...]' for totals of mixed currencies
 */
export function applyMoney(root: ParentNode = document) {
  const selected = getCurrency();
  const r = rates().rates;
  root.querySelectorAll<HTMLElement>('.money').forEach((el) => {
    const to = el.dataset.to || selected;
    let text: string;
    let original: string;
    if (el.dataset.sum) {
      const parts: [number, string][] = JSON.parse(el.dataset.sum);
      const total = parts.reduce((s, [a, c]) => s + convert(a, c, to, r), 0);
      text = formatMoney(total, to);
      original = '';
    } else {
      const amt = Number(el.dataset.amt);
      const from = el.dataset.cur || 'INR';
      const max = el.dataset.max ? Number(el.dataset.max) : undefined;
      text = formatMoney(convert(amt, from, to, r), to) + (max ? ` – ${formatMoney(convert(max, from, to, r), to)}` : '');
      original = from === to ? '' : formatMoney(amt, from) + (max ? ` – ${formatMoney(max, from)}` : '');
    }
    el.textContent = (el.dataset.prefix || '') + text;
    if (original) el.title = `Originally ${original}`;
    else el.removeAttribute('title');
  });
  document.querySelectorAll<HTMLElement>('[data-fx-status]').forEach((el) => {
    const s = rates();
    el.textContent = s.live ? `Live rates · ${new Date(s.updated).toLocaleDateString()}` : `Rates as of ${s.updated || 'build'}`;
  });
}
