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
};

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
