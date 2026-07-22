/**
 * Dashboard statistics model.
 *
 * computeStats() derives every metric from real bookings. DEMO_STATS is only
 * used when the app runs with no Supabase backend configured (pure demo mode).
 */
import { Booking } from '../types';

export type RevenueKey = 'today' | 'week' | 'month' | 'year' | 'custom';
export type BookingKey = 'today' | 'tomorrow' | 'week' | 'month';

export type Stats = {
  revenue: Record<'today' | 'week' | 'month' | 'year', { amount: number; deltaPct: number; sub: string }>;
  bookings: Record<BookingKey, { total: number; done?: number; todo?: number }>;
  clients: { all: number; new: number; returning: number; active: number };
  returnRate: { pct: number; returned: number; all: number; deltaPts: number };
  byService: { name: string; amount: number; pct: number }[];
  trend: { label: string; value: number; current?: boolean }[];
  topClients: { name: string; visits: number; amount: number }[];
  growth: { label: string; value: string; delta: string }[];
};

export function formatMoney(amount: number): string {
  return `$${Math.round(amount).toLocaleString()}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  return x;
}

/** Derive the full dashboard from an artist's / salon's bookings. */
export function computeStats(all: Booking[], now = new Date()): Stats {
  const bookings = all.filter((b) => b.status !== 'cancelled' && b.status !== 'no_show');
  const dollars = (b: Booking) => b.price_cents / 100;

  const sod = startOfDay(now);
  const eod = new Date(sod.getTime() + 86400000);
  const eot = new Date(eod.getTime() + 86400000);
  const yst = new Date(sod.getTime() - 86400000);
  const sow = startOfWeek(now);
  const eow = new Date(sow.getTime() + 7 * 86400000);
  const lastWeek = new Date(sow.getTime() - 7 * 86400000);
  const som = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const soy = new Date(now.getFullYear(), 0, 1);
  const nextYear = new Date(now.getFullYear() + 1, 0, 1);
  const prevYear = new Date(now.getFullYear() - 1, 0, 1);

  const inRange = (b: Booking, from: Date, to: Date) => {
    const t = new Date(b.starts_at).getTime();
    return t >= from.getTime() && t < to.getTime();
  };
  const listR = (from: Date, to: Date) => bookings.filter((b) => inRange(b, from, to));
  const sumR = (from: Date, to: Date) => listR(from, to).reduce((n, b) => n + dollars(b), 0);
  const cntR = (from: Date, to: Date) => listR(from, to).length;
  const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : 0);
  const deltaStr = (a: number, b: number) => `${pct(a, b) >= 0 ? '+' : ''}${pct(a, b)}%`;

  const todayRev = sumR(sod, eod);
  const yRev = sumR(yst, sod);
  const weekRev = sumR(sow, eow);
  const lwRev = sumR(lastWeek, sow);
  const monthRev = sumR(som, nextMonth);
  const pmRev = sumR(prevMonth, som);
  const yearRev = sumR(soy, nextYear);
  const pyRev = sumR(prevYear, soy);

  // clients (grouped by name/id snapshot on the booking)
  const byClient = new Map<string, Booking[]>();
  bookings.forEach((b) => {
    const key = b.customer_name || b.customer_id || 'Guest';
    byClient.set(key, [...(byClient.get(key) ?? []), b]);
  });
  const allClients = byClient.size;
  const returning = [...byClient.values()].filter((l) => l.length > 1).length;
  const ninety = new Date(now.getTime() - 90 * 86400000);
  const active = [...byClient.values()].filter((l) => l.some((b) => new Date(b.starts_at) >= ninety)).length;
  const newThisMonth = [...byClient.values()].filter((l) => {
    const first = l.reduce((m, b) => (new Date(b.starts_at) < new Date(m.starts_at) ? b : m));
    return new Date(first.starts_at) >= som;
  }).length;
  const returnPct = allClients ? Math.round((returning / allClients) * 100) : 0;

  // revenue by service (this month)
  const svc = new Map<string, number>();
  listR(som, nextMonth).forEach((b) => svc.set(b.service_name, (svc.get(b.service_name) ?? 0) + dollars(b)));
  const svcTotal = [...svc.values()].reduce((n, v) => n + v, 0);
  const byService = [...svc.entries()]
    .map(([name, amount]) => ({ name, amount, pct: svcTotal ? Math.round((amount / svcTotal) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // top clients by visit count
  const topClients = [...byClient.entries()]
    .map(([name, l]) => ({ name, visits: l.length, amount: Math.round(l.reduce((n, b) => n + dollars(b), 0)) }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 3);

  // 6-month revenue trend (thousands)
  const trend = Array.from({ length: 6 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const nx = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    return { label: MONTHS[m.getMonth()], value: Math.round((sumR(m, nx) / 1000) * 10) / 10, current: i === 5 };
  });

  const todayList = listR(sod, eod);
  const done = todayList.filter((b) => new Date(b.starts_at) < now).length;

  return {
    revenue: {
      today: { amount: Math.round(todayRev), deltaPct: pct(todayRev, yRev), sub: `Today · vs ${formatMoney(yRev)} yesterday` },
      week: { amount: Math.round(weekRev), deltaPct: pct(weekRev, lwRev), sub: `This week · vs ${formatMoney(lwRev)} last week` },
      month: { amount: Math.round(monthRev), deltaPct: pct(monthRev, pmRev), sub: `${MONTHS[now.getMonth()]} · vs ${formatMoney(pmRev)} last month` },
      year: { amount: Math.round(yearRev), deltaPct: pct(yearRev, pyRev), sub: `${now.getFullYear()} · vs ${formatMoney(pyRev)} last year` },
    },
    bookings: {
      today: { total: todayList.length, done, todo: todayList.length - done },
      tomorrow: { total: cntR(eod, eot) },
      week: { total: cntR(sow, eow) },
      month: { total: cntR(som, nextMonth) },
    },
    clients: { all: allClients, new: newThisMonth, returning, active },
    returnRate: { pct: returnPct, returned: returning, all: allClients, deltaPts: 0 },
    byService,
    trend,
    topClients,
    growth: [
      { label: 'Revenue', value: formatMoney(monthRev), delta: pmRev ? deltaStr(monthRev, pmRev) : '' },
      { label: 'New clients', value: `${newThisMonth}`, delta: '' },
      { label: 'Returning rate', value: `${returnPct}%`, delta: '' },
    ],
  };
}

/** Shown only in pure demo mode (no Supabase configured). Mirrors the design. */
export const DEMO_STATS: Stats = {
  revenue: {
    today: { amount: 320, deltaPct: 12, sub: 'Today · vs $286 yesterday' },
    week: { amount: 2140, deltaPct: 9, sub: 'This week · vs $1,960 last week' },
    month: { amount: 8640, deltaPct: 18, sub: 'July · vs $7,320 last month' },
    year: { amount: 72400, deltaPct: 22, sub: '2026 · vs $59,300 last year' },
  },
  bookings: {
    today: { total: 8, done: 5, todo: 3 },
    tomorrow: { total: 6 },
    week: { total: 34 },
    month: { total: 128 },
  },
  clients: { all: 214, new: 18, returning: 142, active: 96 },
  returnRate: { pct: 66, returned: 142, all: 214, deltaPts: 4 },
  byService: [
    { name: 'Skin Fade', amount: 3200, pct: 37 },
    { name: 'Classic Cut', amount: 2450, pct: 28 },
    { name: 'Cut + Beard', amount: 1980, pct: 23 },
    { name: 'Beard Trim', amount: 1010, pct: 12 },
  ],
  trend: [
    { label: 'Feb', value: 6.2 },
    { label: 'Mar', value: 6.9 },
    { label: 'Apr', value: 7.4 },
    { label: 'May', value: 7.1 },
    { label: 'Jun', value: 8.0 },
    { label: 'Jul', value: 8.6, current: true },
  ],
  topClients: [
    { name: 'James P.', visits: 14, amount: 560 },
    { name: 'Omar D.', visits: 11, amount: 610 },
    { name: 'Leo M.', visits: 9, amount: 410 },
  ],
  growth: [
    { label: 'Revenue', value: '$8,640', delta: '+18%' },
    { label: 'New clients', value: '18', delta: '+25%' },
    { label: 'Returning rate', value: '66%', delta: '+4 pts' },
  ],
};
