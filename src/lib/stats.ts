/**
 * Dashboard statistics model.
 *
 * DEMO_STATS mirrors the design mockups and is used as the display dataset.
 * computeStats() derives the same shape from an artist's real bookings and is
 * used automatically once there's enough history; otherwise the demo dataset
 * keeps the dashboard looking complete.
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

/** Derive stats from all of an artist's bookings; demo fallback when sparse. */
export function computeStats(all: Booking[], now = new Date()): Stats {
  const bookings = all.filter((b) => b.status !== 'cancelled');
  if (bookings.length < 8) return DEMO_STATS;

  const dollars = (b: Booking) => b.price_cents / 100;
  const sod = startOfDay(now);
  const eod = new Date(sod.getTime() + 86400000);
  const eot = new Date(eod.getTime() + 86400000);
  const sow = startOfWeek(now);
  const som = new Date(now.getFullYear(), now.getMonth(), 1);
  const soy = new Date(now.getFullYear(), 0, 1);
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const inRange = (b: Booking, from: Date, to: Date) => {
    const t = new Date(b.starts_at).getTime();
    return t >= from.getTime() && t < to.getTime();
  };
  const sum = (list: Booking[]) => list.reduce((n, b) => n + dollars(b), 0);
  const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : 0);

  const monthList = bookings.filter((b) => inRange(b, som, new Date(now.getFullYear(), now.getMonth() + 1, 1)));
  const prevMonthList = bookings.filter((b) => inRange(b, prevMonth, som));
  const monthRev = sum(monthList);
  const prevMonthRev = sum(prevMonthList);

  // clients
  const byClient = new Map<string, Booking[]>();
  bookings.forEach((b) => {
    const key = b.customer_name || b.customer_id || 'Guest';
    byClient.set(key, [...(byClient.get(key) ?? []), b]);
  });
  const allClients = byClient.size;
  const returning = [...byClient.values()].filter((l) => l.length > 1).length;
  const ninetyAgo = new Date(now.getTime() - 90 * 86400000);
  const active = [...byClient.values()].filter((l) => l.some((b) => new Date(b.starts_at) >= ninetyAgo)).length;
  const newThisMonth = [...byClient.values()].filter((l) => {
    const first = l.reduce((min, b) => (new Date(b.starts_at) < new Date(min.starts_at) ? b : min));
    return new Date(first.starts_at) >= som;
  }).length;

  // by service
  const svc = new Map<string, number>();
  monthList.forEach((b) => svc.set(b.service_name, (svc.get(b.service_name) ?? 0) + dollars(b)));
  const byService = [...svc.entries()]
    .map(([name, amount]) => ({ name, amount, pct: monthRev ? Math.round((amount / monthRev) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // top clients
  const topClients = [...byClient.entries()]
    .map(([name, l]) => ({ name, visits: l.length, amount: Math.round(sum(l)) }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 3);

  // 6-month trend
  const trend = Array.from({ length: 6 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const next = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    return {
      label: MONTHS[m.getMonth()],
      value: Math.round((sum(bookings.filter((b) => inRange(b, m, next))) / 1000) * 10) / 10,
      current: i === 5,
    };
  });

  const returnPct = allClients ? Math.round((returning / allClients) * 100) : 0;

  return {
    revenue: {
      today: { amount: Math.round(sum(bookings.filter((b) => inRange(b, sod, eod)))), deltaPct: 0, sub: 'Today' },
      week: { amount: Math.round(sum(bookings.filter((b) => inRange(b, sow, new Date(sow.getTime() + 7 * 86400000))))), deltaPct: 0, sub: 'This week' },
      month: { amount: Math.round(monthRev), deltaPct: pct(monthRev, prevMonthRev), sub: `${MONTHS[now.getMonth()]} · vs $${Math.round(prevMonthRev).toLocaleString()} last month` },
      year: { amount: Math.round(sum(bookings.filter((b) => inRange(b, soy, new Date(now.getFullYear() + 1, 0, 1))))), deltaPct: 0, sub: `${now.getFullYear()}` },
    },
    bookings: {
      today: {
        total: bookings.filter((b) => inRange(b, sod, eod)).length,
        done: bookings.filter((b) => inRange(b, sod, eod) && new Date(b.starts_at) < now).length,
        todo: bookings.filter((b) => inRange(b, sod, eod) && new Date(b.starts_at) >= now).length,
      },
      tomorrow: { total: bookings.filter((b) => inRange(b, eod, eot)).length },
      week: { total: bookings.filter((b) => inRange(b, sow, new Date(sow.getTime() + 7 * 86400000))).length },
      month: { total: monthList.length },
    },
    clients: { all: allClients, new: newThisMonth, returning, active },
    returnRate: { pct: returnPct, returned: returning, all: allClients, deltaPts: 0 },
    byService: byService.length ? byService : DEMO_STATS.byService,
    trend,
    topClients: topClients.length ? topClients : DEMO_STATS.topClients,
    growth: [
      { label: 'Revenue', value: `$${Math.round(monthRev).toLocaleString()}`, delta: `${pct(monthRev, prevMonthRev) >= 0 ? '+' : ''}${pct(monthRev, prevMonthRev)}%` },
      { label: 'New clients', value: `${newThisMonth}`, delta: '' },
      { label: 'Returning rate', value: `${returnPct}%`, delta: '' },
    ],
  };
}

export function formatMoney(amount: number): string {
  return `$${Math.round(amount).toLocaleString()}`;
}
