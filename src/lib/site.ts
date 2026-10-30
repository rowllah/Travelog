import type { CollectionEntry } from 'astro:content';

export const SITE = {
  title: 'Travelog',
  owner: 'Rowllah',
  tagline: 'Every trip I have taken — itineraries, real budgets and the places worth your time.',
  instagram: 'rowllahbasheer',
  github: { user: 'rowllah', repo: 'Travelog', branch: 'main' },
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

const visitDate = (v: string) => new Date(`${v.length === 4 ? `${v}-01` : v}-01T00:00:00Z`);
const visitDates = (t: Trip) => t.data.visits.map(visitDate).sort((a, b) => +a - +b);
const visitLabel = (v: string) => (v.length === 4 ? v : fmtMonth.format(visitDate(v)));

/** Timeline-only trips: recorded by year or month, with no itinerary yet. */
export function hasDetails(t: Trip) {
  return t.data.days.length > 0;
}

/** The trip's start date, or its latest visit month. Used for sorting and years. */
export function tripStart(t: Trip): Date | undefined {
  return t.data.startDate ?? visitDates(t).at(-1);
}

export function tripYears(t: Trip): number[] {
  if (t.data.startDate) return [t.data.startDate.getUTCFullYear()];
  return [...new Set(visitDates(t).map((d) => d.getUTCFullYear()))];
}

export function tripYearLabel(t: Trip, empty = '') {
  return tripYears(t).join(' & ') || empty;
}

export function tripWhen(t: Trip) {
  const { startDate, endDate } = t.data;
  if (!startDate && t.data.visits.length) return [...t.data.visits].sort().map(visitLabel).join(' & ');
  if (!startDate) return 'Date not recorded';
  if (!endDate) return fmtFull.format(startDate);
  return `${fmtDay.format(startDate)} – ${fmtFull.format(endDate)}`;
}

export function shortName(t: Trip) {
  return t.data.title.split(/\s+—\s+/)[0].replace(/ on a budget$/, '');
}

export function shortYear(t: Trip) {
  return tripYears(t).map((y) => `’${String(y).slice(2)}`).join(' & ');
}

export function tripMonth(t: Trip) {
  if (t.data.startDate) return fmtMonth.format(t.data.startDate);
  return t.data.visits.length ? tripWhen(t) : 'Anytime';
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

export function detailedTrips(trips: Trip[]) {
  return sortTrips(trips).filter(hasDetails);
}

export function sortTrips(trips: Trip[]) {
  return [...trips].sort((a, b) => (+(tripStart(b) ?? 0)) - (+(tripStart(a) ?? 0)));
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
