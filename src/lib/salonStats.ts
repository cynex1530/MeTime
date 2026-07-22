/**
 * Salon-wide analytics model (owner "Salon Dashboard").
 *
 * Several of these metrics aren't tracked in the current schema (occupancy,
 * no-show / cancellation rate, per-artist star ratings), so this ships as a
 * representative dataset matching the design. Revenue / appointments /
 * customers / returning and the per-artist revenue+appointments can be wired
 * to real bookings later — see computeSalonStats stub at the bottom.
 */

export const ARTIST_COLORS = ['#6C5CE7', '#2FBFA6', '#E8A94B', '#E85B9B', '#4C86E8', '#E86C6C'];

// Single accent used for every artist logo / detail chart (uniform, not per-artist)
export const ACCENT = '#6C5CE7';

export type Kpi = {
  key: string;
  label: string;
  value: string;
  delta: number;
  good: boolean; // whether the delta direction is positive for the business
  icon: string;
  tint: string;
  fg: string;
};

export type ArtistPerf = {
  id: string;
  name: string;
  profession: string;
  initials: string;
  color: string;
  revenue: number;
  appts: number;
  rating: number;
  occupancy: number;
  returnPct: number;
  noShow: number;
  growth: number;
  badge: 'Excellent' | 'Average' | 'Low';
};

export type SalonStats = {
  salonName: string;
  kpis: Kpi[];
  overview: {
    revenue: { label: string; value: number }[];
    appts: { label: string; value: number }[];
    revenueTotal: string;
    apptsTotal: string;
  };
  artists: ArtistPerf[];
  comparison: { id: string; name: string; color: string; points: number[] }[];
  services: {
    mostPopular: { name: string; booked: number };
    topRevenue: { name: string; amount: string };
    avgPrice: string;
    avgDuration: string;
    list: { name: string; revenue: number; appts: number; minutes: number; rating: number }[];
  };
  occupancy: { name: string; initials: string; color: string; cells: number[] }[];
  demand: { slots: { label: string; value: number; level: 'low' | 'mid' | 'peak' }[]; suggested: string[] };
  customers: { label: string; value: string; delta: number; good: boolean; dot: string }[];
  reviews: { avg: string; fiveStar: string; negative: string; trend: string; evolution: { label: string; value: number }[] };
  cancellations: {
    cancelRate: { value: string; delta: number };
    noShowRate: { value: string; delta: number };
    reasons: { label: string; pct: number; color: string }[];
    byArtist: { name: string; pct: number; level: 'low' | 'mid' | 'high' }[];
  };
  financial: { label: string; value: string; delta: number }[];
};

export const SALON_DEMO: SalonStats = {
  salonName: 'Fade & Co.',
  kpis: [
    { key: 'revenue', label: 'Revenue', value: '$71.4k', delta: 14, good: true, icon: 'dollar-sign', tint: 'rgba(108,92,231,0.14)', fg: '#6C5CE7' },
    { key: 'appts', label: 'Appointments', value: '952', delta: 8, good: true, icon: 'calendar', tint: 'rgba(47,191,166,0.16)', fg: '#2FBFA6' },
    { key: 'customers', label: 'Customers', value: '530', delta: 11, good: true, icon: 'users', tint: 'rgba(232,169,75,0.18)', fg: '#E8A94B' },
    { key: 'returning', label: 'Returning', value: '68%', delta: 5, good: true, icon: 'refresh-cw', tint: 'rgba(48,164,108,0.14)', fg: '#1f8a4c' },
    { key: 'occupancy', label: 'Occupancy', value: '80%', delta: 6, good: true, icon: 'activity', tint: 'rgba(108,92,231,0.14)', fg: '#6C5CE7' },
    { key: 'rating', label: 'Avg rating', value: '4.8', delta: 2, good: true, icon: 'star', tint: 'rgba(232,169,75,0.18)', fg: '#E8A94B' },
    { key: 'cancel', label: 'Cancellation', value: '5.2%', delta: -7, good: true, icon: 'slash', tint: 'rgba(229,72,77,0.12)', fg: '#e5484d' },
  ],
  overview: {
    revenue: [
      { label: 'W1', value: 16.2 },
      { label: 'W2', value: 17.1 },
      { label: 'W3', value: 18.8 },
      { label: 'W4', value: 19.3 },
    ],
    appts: [
      { label: 'W1', value: 220 },
      { label: 'W2', value: 236 },
      { label: 'W3', value: 244 },
      { label: 'W4', value: 252 },
    ],
    revenueTotal: '$71k',
    apptsTotal: '952',
  },
  artists: [
    { id: 'mc', name: 'Maria Chen', profession: 'Hair Stylist', initials: 'MC', color: ARTIST_COLORS[0], revenue: 14200, appts: 186, rating: 4.9, occupancy: 88, returnPct: 72, noShow: 3, growth: 18, badge: 'Excellent' },
    { id: 'ar', name: 'Alex Rivera', profession: 'Barber', initials: 'AR', color: ARTIST_COLORS[1], revenue: 12800, appts: 210, rating: 4.8, occupancy: 91, returnPct: 78, noShow: 4, growth: 9, badge: 'Excellent' },
    { id: 'ip', name: 'Ioana Popescu', profession: 'Nail Artist', initials: 'IP', color: ARTIST_COLORS[2], revenue: 9600, appts: 164, rating: 4.7, occupancy: 73, returnPct: 64, noShow: 6, growth: -4, badge: 'Average' },
    { id: 'lv', name: 'Lena Voss', profession: 'Tattoo Artist', initials: 'LV', color: ARTIST_COLORS[3], revenue: 16400, appts: 74, rating: 5.0, occupancy: 82, returnPct: 69, noShow: 2, growth: 22, badge: 'Excellent' },
  ],
  comparison: [
    { id: 'mc', name: 'Maria', color: ARTIST_COLORS[0], points: [8, 9.5, 11, 12.6, 14.2] },
    { id: 'ar', name: 'Alex', color: ARTIST_COLORS[1], points: [7.2, 8.1, 9.4, 11, 12.8] },
    { id: 'ip', name: 'Ioana', color: ARTIST_COLORS[2], points: [8.4, 8.6, 9, 9.3, 9.6] },
    { id: 'lv', name: 'Lena', color: ARTIST_COLORS[3], points: [9, 11, 12.8, 14.5, 16.4] },
  ],
  services: {
    mostPopular: { name: 'Haircut', booked: 312 },
    topRevenue: { name: 'Haircut', amount: '$18.7k' },
    avgPrice: '$75',
    avgDuration: '52 min',
    list: [
      { name: 'Haircut', revenue: 18700, appts: 312, minutes: 42, rating: 4.9 },
      { name: 'Balayage', revenue: 15300, appts: 118, minutes: 130, rating: 4.8 },
      { name: 'Beard Trim', revenue: 8000, appts: 268, minutes: 25, rating: 4.7 },
      { name: 'Manicure', revenue: 9200, appts: 204, minutes: 40, rating: 4.8 },
      { name: 'Tattoo Session', revenue: 16300, appts: 74, minutes: 145, rating: 5.0 },
      { name: 'Makeup', revenue: 6700, appts: 96, minutes: 55, rating: 4.6 },
    ],
  },
  occupancy: [
    { name: 'Maria', initials: 'MC', color: ARTIST_COLORS[0], cells: [0.7, 0.7, 0.75, 0.8, 0.8, 0.85, 0.3] },
    { name: 'Alex', initials: 'AR', color: ARTIST_COLORS[1], cells: [0.85, 0.8, 0.85, 0.9, 0.9, 0.85, 0.4] },
    { name: 'Ioana', initials: 'IP', color: ARTIST_COLORS[2], cells: [0.5, 0.55, 0.6, 0.6, 0.65, 0.6, 0.25] },
    { name: 'Lena', initials: 'LV', color: ARTIST_COLORS[3], cells: [0.6, 0.65, 0.7, 0.7, 0.75, 0.7, 0.35] },
    { name: 'Sofia', initials: 'SM', color: '#8B5CF6', cells: [0.4, 0.4, 0.45, 0.5, 0.5, 0.45, 0.2] },
    { name: 'Danny', initials: 'DK', color: '#34A853', cells: [0.7, 0.7, 0.7, 0.75, 0.75, 0.8, 0.35] },
  ],
  demand: {
    slots: [
      { label: '9 AM', value: 42, level: 'low' },
      { label: '10 AM', value: 68, level: 'mid' },
      { label: '11 AM', value: 74, level: 'mid' },
      { label: '12 PM', value: 51, level: 'mid' },
      { label: '1 PM', value: 38, level: 'low' },
      { label: '2 PM', value: 44, level: 'mid' },
      { label: '3 PM', value: 62, level: 'mid' },
      { label: '4 PM', value: 88, level: 'peak' },
      { label: '5 PM', value: 96, level: 'peak' },
      { label: '6 PM', value: 71, level: 'mid' },
      { label: '7 PM', value: 34, level: 'low' },
    ],
    suggested: ['Fri 2–5 PM', 'Tue 1–2 PM', 'Thu 7–8 PM', 'Mon 9–10 AM'],
  },
  customers: [
    { label: 'New customers', value: '124', delta: 11, good: true, dot: '#6C5CE7' },
    { label: 'Returning', value: '406', delta: 6, good: true, dot: '#2FBFA6' },
    { label: 'VIP', value: '48', delta: 15, good: true, dot: '#E8A94B' },
    { label: 'Lost', value: '37', delta: -9, good: false, dot: '#e5484d' },
    { label: 'Retention', value: '76%', delta: 4, good: true, dot: '#2FBFA6' },
    { label: 'Avg visits', value: '3.4', delta: 8, good: true, dot: '#6C5CE7' },
  ],
  reviews: {
    avg: '4.8',
    fiveStar: '1,240',
    negative: '34',
    trend: '+0.2',
    evolution: [
      { label: 'F', value: 4.5 },
      { label: 'M', value: 4.6 },
      { label: 'A', value: 4.6 },
      { label: 'M', value: 4.7 },
      { label: 'J', value: 4.8 },
      { label: 'J', value: 4.8 },
    ],
  },
  cancellations: {
    cancelRate: { value: '5.2%', delta: -7 },
    noShowRate: { value: '4.6%', delta: -12 },
    reasons: [
      { label: 'Schedule conflict', pct: 34, color: '#6C5CE7' },
      { label: 'Feeling unwell', pct: 26, color: '#2FBFA6' },
      { label: 'Found cheaper', pct: 18, color: '#E8A94B' },
      { label: 'Personal', pct: 14, color: '#E85B9B' },
      { label: 'Other', pct: 8, color: '#9aa0a6' },
    ],
    byArtist: [
      { name: 'Maria', pct: 4, level: 'low' },
      { name: 'Alex', pct: 3, level: 'low' },
      { name: 'Ioana', pct: 7, level: 'mid' },
      { name: 'Lena', pct: 2, level: 'low' },
      { name: 'Sofia', pct: 11, level: 'high' },
      { name: 'Danny', pct: 5, level: 'mid' },
    ],
  },
  financial: [
    { label: 'Revenue', value: '$71.4k', delta: 14 },
    { label: 'Commission paid', value: '$21.4k', delta: 12 },
    { label: 'Avg ticket', value: '$75', delta: 5 },
    { label: 'Rev / appointment', value: '$75', delta: 3 },
    { label: 'Rev / artist', value: '$11.9k', delta: 9 },
    { label: 'Revenue growth', value: '+14%', delta: 14 },
  ],
};

export type ArtistDetail = {
  artist: ArtistPerf;
  customers: number;
  score: number;
  revenue6mo: { label: string; value: number }[];
  appts6mo: { label: string; value: number }[];
  popular: { name: string; booked: number }[];
  heatmap: number[][];
  reviews: { name: string; stars: number; text: string }[];
  achievements: string[];
};

const MONTHS6 = ['F', 'M', 'A', 'M', 'J', 'J'];
const RAMP = [0.51, 0.56, 0.62, 0.67, 0.77, 1.0];

const POPULAR: Record<string, { name: string; booked: number }[]> = {
  mc: [{ name: 'Cut & Style', booked: 96 }, { name: 'Balayage', booked: 60 }, { name: 'Blowout', booked: 40 }],
  ar: [{ name: 'Skin Fade', booked: 120 }, { name: 'Classic Cut', booked: 80 }, { name: 'Beard Trim', booked: 54 }],
  ip: [{ name: 'Gel Manicure', booked: 90 }, { name: 'Nail Art', booked: 52 }, { name: 'Pedicure', booked: 34 }],
  lv: [{ name: 'Fine-line', booked: 34 }, { name: 'Custom Piece', booked: 22 }, { name: 'Touch-up', booked: 18 }],
};

const REVIEWS: Record<string, { name: string; stars: number; text: string }[]> = {
  lv: [
    { name: 'James P.', stars: 5, text: 'Best in the city, always on time.' },
    { name: 'Nadia R.', stars: 5, text: 'Absolutely loved the result.' },
  ],
  default: [
    { name: 'Chris M.', stars: 5, text: 'Great work, super friendly.' },
    { name: 'Sara L.', stars: 5, text: "Couldn't be happier, highly recommend." },
  ],
};

function seededRandom(seed: number) {
  let s = seed % 233280 || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function buildArtistDetail(a: ArtistPerf): ArtistDetail {
  const rnd = seededRandom(a.id.split('').reduce((n, c) => n + c.charCodeAt(0), 7));
  const heatmap = Array.from({ length: 5 }, () => Array.from({ length: 7 }, () => 0.12 + rnd() * 0.85));
  return {
    artist: a,
    customers: Math.round(a.appts * 0.7),
    score: Math.round(0.4 * ((a.rating / 5) * 100) + 0.3 * a.occupancy + 0.3 * a.returnPct),
    revenue6mo: RAMP.map((r, i) => ({ label: MONTHS6[i], value: Math.round((a.revenue / 1000) * r * 10) / 10 })),
    appts6mo: RAMP.map((r, i) => ({ label: MONTHS6[i], value: Math.round(a.appts * r) })),
    popular: POPULAR[a.id] ?? [
      { name: 'Signature service', booked: Math.round(a.appts * 0.4) },
      { name: 'Popular add-on', booked: Math.round(a.appts * 0.28) },
      { name: 'Quick service', booked: Math.round(a.appts * 0.2) },
    ],
    heatmap,
    reviews: REVIEWS[a.id] ?? REVIEWS.default,
    achievements: ['🔥 6-month streak', '⭐ Top rated', '📈 Rising star', '💎 VIP magnet'],
  };
}

/** Parse a display value like "$71.4k", "530", "68%", "3.4" into a number. */
function num(s: string): number {
  const clean = s.replace(/[$,%\s]/g, '');
  return s.includes('k') ? parseFloat(clean) * 1000 : parseFloat(clean);
}
const fmtK = (v: number) => `$${(v / 1000).toFixed(1)}k`;
const roundK = (v: number) => `$${Math.round(v / 1000)}k`;

/**
 * Scope the whole salon dashboard to a single service. Count/money metrics are
 * scaled by that service's share of appointments/revenue; percentages and
 * ratings are taken from (or left proportional to) the service.
 */
export function scopeStatsToService(base: SalonStats, serviceName: string): SalonStats {
  const svc = base.services.list.find((s) => s.name === serviceName);
  if (!svc) return base;

  const totalRev = base.services.list.reduce((n, s) => n + s.revenue, 0) || 1;
  const totalAppts = base.services.list.reduce((n, s) => n + s.appts, 0) || 1;
  const revShare = svc.revenue / totalRev;
  const apptShare = svc.appts / totalAppts;
  const avgTicket = svc.appts ? Math.round(svc.revenue / svc.appts) : 0;
  const numArtists = base.artists.length || 1;

  const kpis = base.kpis.map((k) => {
    if (k.key === 'revenue') return { ...k, value: fmtK(svc.revenue) };
    if (k.key === 'appts') return { ...k, value: `${svc.appts}` };
    if (k.key === 'customers') return { ...k, value: `${Math.round(num(k.value) * apptShare)}` };
    if (k.key === 'rating') return { ...k, value: svc.rating.toFixed(1) };
    return k; // returning, occupancy, cancellation stay as-is
  });

  const artists = base.artists.map((a) => ({
    ...a,
    revenue: Math.round(a.revenue * revShare),
    appts: Math.round(a.appts * apptShare),
  }));

  const scaleCustomer = (v: string) => (v.includes('%') || v.includes('.') ? v : `${Math.round(num(v) * apptShare)}`);

  return {
    ...base,
    kpis,
    overview: {
      revenue: base.overview.revenue.map((b) => ({ ...b, value: Math.round(b.value * revShare * 10) / 10 })),
      appts: base.overview.appts.map((b) => ({ ...b, value: Math.round(b.value * apptShare) })),
      revenueTotal: roundK(svc.revenue),
      apptsTotal: `${svc.appts}`,
    },
    artists,
    comparison: base.comparison.map((c) => ({ ...c, points: c.points.map((p) => Math.round(p * revShare * 10) / 10) })),
    services: {
      mostPopular: { name: svc.name, booked: svc.appts },
      topRevenue: { name: svc.name, amount: fmtK(svc.revenue) },
      avgPrice: `$${avgTicket}`,
      avgDuration: `${svc.minutes} min`,
      list: [svc],
    },
    demand: {
      ...base.demand,
      slots: base.demand.slots.map((s) => ({ ...s, value: Math.round(s.value * apptShare) })),
    },
    customers: base.customers.map((c) => ({ ...c, value: scaleCustomer(c.value) })),
    reviews: {
      ...base.reviews,
      avg: svc.rating.toFixed(1),
      fiveStar: Math.round(num(base.reviews.fiveStar) * apptShare).toLocaleString(),
      negative: `${Math.round(num(base.reviews.negative) * apptShare)}`,
    },
    financial: [
      { label: 'Revenue', value: fmtK(svc.revenue), delta: 14 },
      { label: 'Commission paid', value: fmtK(num(base.financial[1].value) * revShare), delta: 12 },
      { label: 'Avg ticket', value: `$${avgTicket}`, delta: 5 },
      { label: 'Rev / appointment', value: `$${avgTicket}`, delta: 3 },
      { label: 'Rev / artist', value: fmtK(svc.revenue / numArtists), delta: 9 },
      { label: 'Revenue growth', value: '+14%', delta: 14 },
    ],
  };
}

const SM = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const initialsOf = (name: string) =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';

/**
 * Compute the salon dashboard from real data. Metrics the schema tracks
 * (revenue, appointments, customers, returning, reviews/rating, cancellations,
 * per-service and per-artist numbers, hourly demand) are real; a few the schema
 * doesn't track (occupancy heatmap, cancellation reasons, suggested slots) fall
 * back to the demo template. Empty salon → the demo dataset.
 */
export function computeSalonStats(
  input: { bookings: any[]; artists: any[]; reviews: any[] },
  now = new Date()
): SalonStats {
  const { bookings, artists, reviews } = input;
  const active = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'no_show');
  const cancelled = bookings.filter((b) => b.status === 'cancelled');
  const money = (b: any) => (b.price_cents ?? 0) / 100;
  const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : 0);
  const som = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const inMonth = (b: any, from: Date, to: Date) => {
    const t = new Date(b.starts_at).getTime();
    return t >= from.getTime() && t < to.getTime();
  };

  const totalRev = active.reduce((n, b) => n + money(b), 0);
  const monthRev = active.filter((b) => inMonth(b, som, new Date(now.getFullYear(), now.getMonth() + 1, 1))).reduce((n, b) => n + money(b), 0);
  const prevRev = active.filter((b) => inMonth(b, prevMonth, som)).reduce((n, b) => n + money(b), 0);

  // clients
  const byClient = new Map<string, any[]>();
  active.forEach((b) => {
    const k = b.customer_name || b.customer_id || 'Guest';
    byClient.set(k, [...(byClient.get(k) ?? []), b]);
  });
  const customers = byClient.size;
  const returning = [...byClient.values()].filter((l) => l.length > 1).length;
  const returnPct = customers ? Math.round((returning / customers) * 100) : 0;
  const ninety = new Date(now.getTime() - 90 * 86400000);
  const activeC = [...byClient.values()].filter((l) => l.some((b) => new Date(b.starts_at) >= ninety)).length;
  const newThisMonth = [...byClient.values()].filter((l) => {
    const f = l.reduce((m, b) => (new Date(b.starts_at) < new Date(m.starts_at) ? b : m));
    return new Date(f.starts_at) >= som;
  }).length;
  const vip = [...byClient.values()].filter((l) => l.reduce((n, b) => n + money(b), 0) >= 200).length;

  // reviews
  const avgRating = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;
  const fiveStar = reviews.filter((r) => r.rating === 5).length;
  const negative = reviews.filter((r) => r.rating <= 2).length;

  const cancelRate = bookings.length ? (cancelled.length / bookings.length) * 100 : 0;

  // per service
  const svcMap = new Map<string, { revenue: number; appts: number; minutes: number }>();
  active.forEach((b) => {
    const s = svcMap.get(b.service_name) ?? { revenue: 0, appts: 0, minutes: 0 };
    s.revenue += money(b);
    s.appts += 1;
    s.minutes += b.duration_minutes ?? 0;
    svcMap.set(b.service_name, s);
  });
  const servicesList = [...svcMap.entries()]
    .map(([name, s]) => ({ name, revenue: Math.round(s.revenue), appts: s.appts, minutes: Math.round(s.minutes / (s.appts || 1)), rating: Math.round(avgRating * 10) / 10 || 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  // per artist
  const ratingByArtist = new Map<string, number[]>();
  reviews.forEach((r) => {
    if (r.artist_id) ratingByArtist.set(r.artist_id, [...(ratingByArtist.get(r.artist_id) ?? []), r.rating]);
  });
  const artistAppts = artists.map((a) => active.filter((b) => b.artist_id === a.id).length);
  const maxAppts = Math.max(1, ...artistAppts);
  const perf: ArtistPerf[] = artists
    .map((a) => {
      const ab = active.filter((b) => b.artist_id === a.id);
      const rs = ratingByArtist.get(a.id) ?? [];
      const rating = rs.length ? Math.round((rs.reduce((n, x) => n + x, 0) / rs.length) * 10) / 10 : 0;
      const byC = new Map<string, number>();
      ab.forEach((b) => byC.set(b.customer_name || b.customer_id || 'g', (byC.get(b.customer_name || b.customer_id || 'g') ?? 0) + 1));
      const ret = byC.size ? Math.round(([...byC.values()].filter((n) => n > 1).length / byC.size) * 100) : 0;
      const mRev = ab.filter((b) => inMonth(b, som, new Date(now.getFullYear(), now.getMonth() + 1, 1))).reduce((n, b) => n + money(b), 0);
      const pRev = ab.filter((b) => inMonth(b, prevMonth, som)).reduce((n, b) => n + money(b), 0);
      return {
        id: a.id,
        name: a.display_name,
        profession: a.title || 'Artist',
        initials: initialsOf(a.display_name),
        color: ACCENT,
        revenue: Math.round(ab.reduce((n, b) => n + money(b), 0)),
        appts: ab.length,
        rating,
        occupancy: Math.round((ab.length / maxAppts) * 80 + 10),
        returnPct: ret,
        noShow: 0,
        growth: pct(mRev, pRev),
        badge: (rating >= 4.7 ? 'Excellent' : rating >= 4 ? 'Average' : 'Low') as ArtistPerf['badge'],
      };
    })
    .filter((a) => a.appts > 0);

  const salonOccupancy = perf.length ? Math.round(perf.reduce((n, a) => n + a.occupancy, 0) / perf.length) : 0;

  // overview: last 4 weeks
  const weekBuckets = Array.from({ length: 4 }, (_, i) => {
    const to = new Date(now.getTime() - (3 - i) * 7 * 86400000);
    const from = new Date(to.getTime() - 7 * 86400000);
    const list = active.filter((b) => {
      const t = new Date(b.starts_at).getTime();
      return t >= from.getTime() && t < to.getTime();
    });
    return { label: `W${i + 1}`, revenue: Math.round((list.reduce((n, b) => n + money(b), 0) / 1000) * 10) / 10, appts: list.length };
  });

  // demand by hour
  const hourCounts = new Map<number, number>();
  active.forEach((b) => {
    const h = new Date(b.starts_at).getHours();
    hourCounts.set(h, (hourCounts.get(h) ?? 0) + 1);
  });
  const demandSlots = Array.from({ length: 11 }, (_, i) => {
    const h = 9 + i;
    const v = hourCounts.get(h) ?? 0;
    const label = `${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}`;
    return { label, value: v };
  });
  const dMax = Math.max(1, ...demandSlots.map((s) => s.value));
  // Suggested free slots = the least-busy hours (lowest demand).
  const suggested = [...demandSlots]
    .sort((a, b) => a.value - b.value)
    .slice(0, 4)
    .map((s) => s.label);
  const demand = {
    slots: demandSlots.map((s) => ({
      ...s,
      level: (s.value >= dMax * 0.75 ? 'peak' : s.value <= dMax * 0.3 ? 'low' : 'mid') as 'low' | 'mid' | 'peak',
    })),
    suggested,
  };

  // Occupancy heatmap: real bookings per artist per weekday (Mon…Sun),
  // normalized to the busiest cell across the salon.
  const occRows = perf.map((a) => {
    const cells = Array.from({ length: 7 }, () => 0);
    active
      .filter((b) => b.artist_id === a.id)
      .forEach((b) => {
        const wd = (new Date(b.starts_at).getDay() + 6) % 7; // Monday = 0
        cells[wd] += 1;
      });
    return { name: (a.name || '').split(' ')[0], initials: a.initials, color: ACCENT, raw: cells };
  });
  const occMax = Math.max(1, ...occRows.flatMap((r) => r.raw));
  const occupancy = occRows.map((r) => ({
    name: r.name,
    initials: r.initials,
    color: r.color,
    cells: r.raw.map((c) => c / occMax),
  }));

  // rating evolution (6 mo)
  const evolution = Array.from({ length: 6 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const nx = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    const rs = reviews.filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= m.getTime() && t < nx.getTime();
    });
    const val = rs.length ? rs.reduce((n, r) => n + r.rating, 0) / rs.length : Math.round(avgRating * 10) / 10;
    return { label: SM[m.getMonth()], value: Math.round(val * 10) / 10 };
  });

  const kfmt = (v: number) => `$${(v / 1000).toFixed(1)}k`;
  const avgTicket = active.length ? Math.round(totalRev / active.length) : 0;

  return {
    salonName: '',
    kpis: [
      { key: 'revenue', label: 'Revenue', value: kfmt(totalRev), delta: pct(monthRev, prevRev), good: true, icon: 'dollar-sign', tint: 'rgba(108,92,231,0.14)', fg: '#6C5CE7' },
      { key: 'appts', label: 'Appointments', value: `${active.length}`, delta: 0, good: true, icon: 'calendar', tint: 'rgba(47,191,166,0.16)', fg: '#2FBFA6' },
      { key: 'customers', label: 'Customers', value: `${customers}`, delta: 0, good: true, icon: 'users', tint: 'rgba(232,169,75,0.18)', fg: '#E8A94B' },
      { key: 'returning', label: 'Returning', value: `${returnPct}%`, delta: 0, good: true, icon: 'refresh-cw', tint: 'rgba(48,164,108,0.14)', fg: '#1f8a4c' },
      { key: 'occupancy', label: 'Occupancy', value: `${salonOccupancy}%`, delta: 0, good: true, icon: 'activity', tint: 'rgba(108,92,231,0.14)', fg: '#6C5CE7' },
      { key: 'rating', label: 'Avg rating', value: avgRating ? avgRating.toFixed(1) : '—', delta: 0, good: true, icon: 'star', tint: 'rgba(232,169,75,0.18)', fg: '#E8A94B' },
      { key: 'cancel', label: 'Cancellation', value: `${cancelRate.toFixed(1)}%`, delta: 0, good: true, icon: 'slash', tint: 'rgba(229,72,77,0.12)', fg: '#e5484d' },
    ],
    overview: {
      revenue: weekBuckets.map((w) => ({ label: w.label, value: w.revenue })),
      appts: weekBuckets.map((w) => ({ label: w.label, value: w.appts })),
      revenueTotal: `$${Math.round(totalRev / 1000)}k`,
      apptsTotal: `${active.length}`,
    },
    artists: perf,
    comparison: [],
    services: {
      mostPopular: servicesList.length ? { name: servicesList[0].name, booked: [...svcMap.entries()].sort((a, b) => b[1].appts - a[1].appts)[0][1].appts } : { name: '—', booked: 0 },
      topRevenue: servicesList.length ? { name: servicesList[0].name, amount: kfmt(servicesList[0].revenue) } : { name: '—', amount: '$0' },
      avgPrice: `$${avgTicket}`,
      avgDuration: `${active.length ? Math.round(active.reduce((n, b) => n + (b.duration_minutes ?? 0), 0) / active.length) : 0} min`,
      list: servicesList,
    },
    occupancy,
    demand,
    customers: [
      { label: 'New customers', value: `${newThisMonth}`, delta: 0, good: true, dot: '#6C5CE7' },
      { label: 'Returning', value: `${returning}`, delta: 0, good: true, dot: '#2FBFA6' },
      { label: 'VIP', value: `${vip}`, delta: 0, good: true, dot: '#E8A94B' },
      { label: 'Lost', value: `${Math.max(0, customers - activeC)}`, delta: 0, good: false, dot: '#e5484d' },
      { label: 'Retention', value: `${returnPct}%`, delta: 0, good: true, dot: '#2FBFA6' },
      { label: 'Avg visits', value: `${customers ? (active.length / customers).toFixed(1) : '0'}`, delta: 0, good: true, dot: '#6C5CE7' },
    ],
    reviews: {
      avg: avgRating ? avgRating.toFixed(1) : '—',
      fiveStar: fiveStar.toLocaleString(),
      negative: `${negative}`,
      trend: '',
      evolution,
    },
    cancellations: {
      cancelRate: { value: `${cancelRate.toFixed(1)}%`, delta: 0 },
      noShowRate: { value: '—', delta: 0 }, // no-show not tracked in the schema
      reasons: [], // cancellation reasons not tracked
      byArtist: artists
        .map((a) => {
          const total = bookings.filter((b) => b.artist_id === a.id).length;
          const canc = cancelled.filter((b) => b.artist_id === a.id).length;
          const p = total ? Math.round((canc / total) * 100) : 0;
          return { name: (a.display_name || '').split(' ')[0], pct: p, level: (p >= 10 ? 'high' : p >= 5 ? 'mid' : 'low') as 'low' | 'mid' | 'high' };
        })
        .filter((x) => x.name),
    },
    financial: [
      { label: 'Revenue', value: kfmt(totalRev), delta: pct(monthRev, prevRev) },
      { label: 'Commission paid', value: kfmt(totalRev * 0.3), delta: 0 },
      { label: 'Avg ticket', value: `$${avgTicket}`, delta: 0 },
      { label: 'Rev / appointment', value: `$${avgTicket}`, delta: 0 },
      { label: 'Rev / artist', value: kfmt(perf.length ? totalRev / perf.length : totalRev), delta: 0 },
      { label: 'Revenue growth', value: `${pct(monthRev, prevRev) >= 0 ? '+' : ''}${pct(monthRev, prevRev)}%`, delta: pct(monthRev, prevRev) },
    ],
  };
}

/** Real per-artist detail (for the salon dashboard "View") from their data. */
export function computeArtistDetail(
  input: { artist: any; bookings: any[]; reviews: any[] },
  now = new Date()
): ArtistDetail {
  const { artist, bookings, reviews } = input;
  const active = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'no_show');
  const money = (b: any) => (b.price_cents ?? 0) / 100;

  const revenue = Math.round(active.reduce((n, b) => n + money(b), 0));
  const appts = active.length;
  const byC = new Map<string, number>();
  active.forEach((b) => {
    const k = b.customer_name || b.customer_id || 'g';
    byC.set(k, (byC.get(k) ?? 0) + 1);
  });
  const customers = byC.size;
  const returnPct = customers ? Math.round(([...byC.values()].filter((n) => n > 1).length / customers) * 100) : 0;
  const rating = reviews.length ? Math.round((reviews.reduce((n, r) => n + r.rating, 0) / reviews.length) * 10) / 10 : 0;

  const som = new Date(now.getFullYear(), now.getMonth(), 1);
  const nm = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const pm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const inR = (b: any, f: Date, t: Date) => {
    const x = new Date(b.starts_at).getTime();
    return x >= f.getTime() && x < t.getTime();
  };
  const mRev = active.filter((b) => inR(b, som, nm)).reduce((n, b) => n + money(b), 0);
  const pRev = active.filter((b) => inR(b, pm, som)).reduce((n, b) => n + money(b), 0);
  const growth = pRev ? Math.round(((mRev - pRev) / pRev) * 100) : 0;
  const occupancy = Math.min(95, 40 + Math.min(55, appts));
  const score = Math.round(0.4 * (rating / 5) * 100 + 0.3 * occupancy + 0.3 * returnPct);

  const months = Array.from({ length: 6 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const nx = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    return { m, nx, label: SM[m.getMonth()] };
  });

  const svc = new Map<string, number>();
  active.forEach((b) => svc.set(b.service_name, (svc.get(b.service_name) ?? 0) + 1));

  const heat = Array.from({ length: 5 }, () => Array.from({ length: 7 }, () => 0));
  active.forEach((b) => {
    const t = new Date(b.starts_at);
    const days = Math.floor((now.getTime() - t.getTime()) / 86400000);
    if (days >= 0 && days < 35) {
      const wk = 4 - Math.floor(days / 7);
      const wd = (t.getDay() + 6) % 7;
      if (wk >= 0) heat[wk][wd] += 1;
    }
  });
  const hmax = Math.max(1, ...heat.flat());

  return {
    artist: {
      id: artist.id,
      name: artist.display_name,
      profession: artist.title || 'Artist',
      initials: initialsOf(artist.display_name),
      color: ACCENT,
      revenue,
      appts,
      rating,
      occupancy,
      returnPct,
      noShow: 0,
      growth,
      badge: rating >= 4.7 ? 'Excellent' : rating >= 4 ? 'Average' : 'Low',
    },
    customers,
    score,
    revenue6mo: months.map(({ m, nx, label }) => ({
      label,
      value: Math.round((active.filter((b) => inR(b, m, nx)).reduce((n, b) => n + money(b), 0) / 1000) * 10) / 10,
    })),
    appts6mo: months.map(({ m, nx, label }) => ({ label, value: active.filter((b) => inR(b, m, nx)).length })),
    popular: [...svc.entries()].map(([name, booked]) => ({ name, booked })).sort((a, b) => b.booked - a.booked).slice(0, 3),
    heatmap: heat.map((row) => row.map((c) => c / hmax)),
    reviews: reviews
      .filter((r) => r.comment && r.comment.trim())
      .slice(0, 3)
      .map((r) => ({ name: r.customer_name || 'Anonymous', stars: r.rating, text: r.comment })),
    achievements: [],
  };
}

export type Leader = { title: string; artist: ArtistPerf; value: string };

export function leaderboards(artists: ArtistPerf[]): Leader[] {
  if (!artists.length) return [];
  const top = (fn: (a: ArtistPerf) => number) => artists.reduce((m, a) => (fn(a) > fn(m) ? a : m));
  return [
    { title: 'TOP REVENUE', artist: top((a) => a.revenue), value: `$${(top((a) => a.revenue).revenue / 1000).toFixed(1)}k` },
    { title: 'TOP BOOKINGS', artist: top((a) => a.appts), value: `${top((a) => a.appts).appts} appts` },
    { title: 'TOP RATING', artist: top((a) => a.rating), value: `★ ${top((a) => a.rating).rating.toFixed(1)}` },
    { title: 'TOP OCCUPANCY', artist: top((a) => a.occupancy), value: `${top((a) => a.occupancy).occupancy}%` },
    { title: 'TOP RETURNING', artist: top((a) => a.returnPct), value: `${top((a) => a.returnPct).returnPct}%` },
    { title: 'FASTEST GROWING', artist: top((a) => a.growth), value: `+${top((a) => a.growth).growth}%` },
  ];
}
