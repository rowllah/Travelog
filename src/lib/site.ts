import type { CollectionEntry } from 'astro:content';

export const SITE = {
  title: 'Travelog',
  owner: 'Rowllah',
  tagline: 'Every trip I have taken — itineraries, real budgets and the places worth your time.',
  github: { user: 'rowllah', repo: 'travelog', branch: 'main' },
};

export const GITHUB_REPO_URL = `https://github.com/${SITE.github.user}/${SITE.github.repo}`;

export const PLACE_LABELS: Record<string, { label: string; icon: string }> = {
  stay: { label: 'Hotels & stays', icon: '🛏️' },
  food: { label: 'Restaurants & food', icon: '🍽️' },
  activity: { label: 'Activities', icon: '🧭' },
  experience: { label: 'Experiences', icon: '✨' },
  operator: { label: 'Guides & operators', icon: '🤝' },
};

export const BUDGET_LABELS: Record<string, string> = {
  flights: 'Flights',
  visa: 'Visa & permits',
  insurance: 'Insurance',
  stay: 'Stay',
  food: 'Food',
  transport: 'Local transport',
  activities: 'Activities',
  shopping: 'Shopping',
  package: 'Package / tours',
  other: 'Other',
};

/** Categories that don't scale with the number of days in the planner. */
export const FIXED_CATEGORIES = ['flights', 'visa', 'insurance'];

export function url(path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

export type Trip = CollectionEntry<'trips'>;

export function tripDays(t: Trip) {
  const { startDate, endDate, days } = t.data;
  if (startDate && endDate) return Math.round((+endDate - +startDate) / 86_400_000) + 1;
  return days.length || 0;
}

const fmtMonth = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const fmtDay = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const fmtFull = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const fmtWeekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

export function tripWhen(t: Trip) {
  const { startDate, endDate } = t.data;
  if (!startDate) return 'Date not recorded';
  if (!endDate) return fmtFull.format(startDate);
  return `${fmtDay.format(startDate)} – ${fmtFull.format(endDate)}`;
}

export function tripMonth(t: Trip) {
  return t.data.startDate ? fmtMonth.format(t.data.startDate) : 'Anytime';
}

export function dayDate(t: Trip, index: number) {
  if (!t.data.startDate) return '';
  return fmtWeekday.format(new Date(+t.data.startDate + index * 86_400_000));
}

export function formatDate(d: Date) {
  return fmtFull.format(d);
}

export function isUpcoming(t: Trip) {
  return t.data.upcoming || (!!t.data.startDate && +t.data.startDate > Date.now());
}

export function sortTrips(trips: Trip[]) {
  return [...trips].sort((a, b) => (+(b.data.startDate ?? 0)) - (+(a.data.startDate ?? 0)));
}

/** Splits a leading "HH:MM" off an itinerary line. */
export function splitTime(line: string) {
  const m = line.match(/^(\d{1,2}:\d{2})\s+(.*)$/);
  return m ? { time: m[1], text: m[2] } : { time: '', text: line };
}

export function perPersonBudget(t: Trip) {
  const b = t.data.budget;
  if (!b) return [];
  return b.items.map((i) => ({ ...i, amount: i.amount / b.travellers }));
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
