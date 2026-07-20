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
    { key: 'noshow', label: 'No-show rate', value: '4.6%', delta: -12, good: true, icon: 'x', tint: 'rgba(232,91,155,0.14)', fg: '#E85B9B' },
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
