/**
 * Sample data lifted from the design prototype. Used as a fallback when the
 * Supabase env vars aren't configured (demo mode) or a query returns nothing,
 * so the app is reviewable end-to-end without a backend.
 */
import { Artist, Booking, Category, Salon, Service } from '../types';

export const SAMPLE_CATEGORIES: Category[] = [
  { id: 'barber', name: 'Barber', audience: 'him', image_url: null, count: 24 },
  { id: 'beard', name: 'Beard & Shave', audience: 'him', image_url: null, count: 11 },
  { id: 'skincare', name: 'Skincare', audience: 'him', image_url: null, count: 9 },
  { id: 'hair', name: 'Hair Salon', audience: 'her', image_url: null, count: 31 },
  { id: 'nails', name: 'Nails', audience: 'her', image_url: null, count: 22 },
  { id: 'lashes', name: 'Lashes & Brows', audience: 'her', image_url: null, count: 15 },
  { id: 'waxing', name: 'Waxing', audience: 'her', image_url: null, count: 12 },
  { id: 'tattoo', name: 'Tattoo', audience: 'both', image_url: null, count: 8 },
  { id: 'solarium', name: 'Solarium', audience: 'both', image_url: null, count: 6 },
  { id: 'massage', name: 'Massage', audience: 'both', image_url: null, count: 14 },
];

export const SAMPLE_SALONS: Salon[] = [
  { id: 'fade', name: 'Fade & Co.', category_ids: ['barber', 'beard'], rating: 4.9, reviews_count: 214, distance: '0.4 mi', area: 'Downtown', tag: 'Barbershop', city: 'San Francisco, CA', audience: 'him', cover_image_url: null, sub_services: ['Haircut', 'Beard', 'Shave'], description: 'A modern barbershop built on precision cuts and good conversation. Walk-ins welcome, but our regulars book ahead for the chair by the window.' },
  { id: 'sharp', name: 'Sharp Studio', category_ids: ['barber', 'beard', 'skincare'], rating: 4.7, reviews_count: 98, distance: '0.9 mi', area: 'SoMa', tag: 'Grooming', city: 'San Francisco, CA', audience: 'him', cover_image_url: null, sub_services: [], description: 'Full-service grooming lounge — cuts, hot-towel shaves, and skin treatments in a calm, minimal space.' },
  { id: 'bloom', name: 'Bloom Hair Bar', category_ids: ['hair'], rating: 4.8, reviews_count: 176, distance: '0.6 mi', area: 'Hayes Valley', tag: 'Hair salon', city: 'San Francisco, CA', audience: 'her', cover_image_url: null, sub_services: [], description: 'Color specialists and cutters obsessed with healthy hair. Complimentary tea and a scalp massage with every visit.' },
  { id: 'polish', name: 'Polish Room', category_ids: ['nails'], rating: 4.9, reviews_count: 143, distance: '0.5 mi', area: 'Marina', tag: 'Nail studio', city: 'San Francisco, CA', audience: 'her', cover_image_url: null, sub_services: [], description: 'Clean, quiet nail studio. Gel, structured manicures and hand-painted art by appointment only.' },
  { id: 'lash', name: 'Flutter Lash', category_ids: ['lashes', 'waxing'], rating: 4.8, reviews_count: 87, distance: '1.1 mi', area: 'Nob Hill', tag: 'Lash & brow', city: 'San Francisco, CA', audience: 'her', cover_image_url: null, sub_services: [], description: 'Lash artists and brow experts helping you wake up ready. Gentle, meticulous, and always on time.' },
  { id: 'ink', name: 'Ink Theory', category_ids: ['tattoo'], rating: 5.0, reviews_count: 132, distance: '1.3 mi', area: 'Mission', tag: 'Tattoo studio', city: 'San Francisco, CA', audience: 'both', cover_image_url: null, sub_services: [], description: 'Custom tattoos and fine-line work in a private, sterile studio. Book a consult and bring your ideas.' },
  { id: 'glow', name: 'Glow Solarium', category_ids: ['solarium'], rating: 4.5, reviews_count: 54, distance: '0.8 mi', area: 'Downtown', tag: 'Solarium', city: 'San Francisco, CA', audience: 'both', cover_image_url: null, sub_services: [], description: 'Premium tanning beds and spray tans with skin-safe tech and expert guidance for an even, natural glow.' },
  { id: 'calm', name: 'Calm Room', category_ids: ['massage'], rating: 4.9, reviews_count: 201, distance: '0.7 mi', area: 'Pacific Heights', tag: 'Massage', city: 'San Francisco, CA', audience: 'both', cover_image_url: null, sub_services: [], description: 'Deep tissue, Swedish and sports massage from licensed therapists. Leave lighter than you came.' },
];

const baseArtist = { profile_id: null, bio: null, email: null, photo_url: null, slot_minutes: 60, on_vacation: false };

export const SAMPLE_ARTISTS: Artist[] = [
  { ...baseArtist, id: 'ar1', salon_id: 'fade', display_name: 'Marco Rossi', title: 'Master', years_experience: 8, rating: 4.9 },
  { ...baseArtist, id: 'ar2', salon_id: 'fade', display_name: 'Danny Kim', title: 'Senior', years_experience: 5, rating: 4.8 },
  { ...baseArtist, id: 'ar3', salon_id: 'fade', display_name: 'Ava Stone', title: 'Stylist', years_experience: 4, rating: 4.9 },
  { ...baseArtist, id: 'ai1', salon_id: 'ink', display_name: 'Lena Voss', title: 'Fine-line', years_experience: 7, rating: 5.0 },
  { ...baseArtist, id: 'ai2', salon_id: 'ink', display_name: 'Rae Ortiz', title: 'Custom', years_experience: 6, rating: 4.9 },
];

/** Default artist set for salons without their own roster (as in the prototype) */
export function sampleArtistsForSalon(salonId: string): Artist[] {
  const own = SAMPLE_ARTISTS.filter((a) => a.salon_id === salonId);
  if (own.length) return own;
  return SAMPLE_ARTISTS.filter((a) => a.salon_id === 'fade').map((a) => ({ ...a, salon_id: salonId }));
}

const SERVICE_MAP: Record<string, Array<{ name: string; duration_minutes: number; price_cents: number }>> = {
  barber: [
    { name: 'Classic Cut', duration_minutes: 45, price_cents: 3500 },
    { name: 'Skin Fade', duration_minutes: 50, price_cents: 4000 },
    { name: 'Cut + Beard', duration_minutes: 60, price_cents: 5500 },
  ],
  tattoo: [
    { name: 'Small Tattoo', duration_minutes: 120, price_cents: 12000 },
    { name: 'Custom Piece', duration_minutes: 180, price_cents: 25000 },
    { name: 'Consultation', duration_minutes: 30, price_cents: 0 },
  ],
  hair: [
    { name: 'Cut & Style', duration_minutes: 60, price_cents: 6000 },
    { name: 'Full Color', duration_minutes: 120, price_cents: 14000 },
    { name: 'Blowout', duration_minutes: 45, price_cents: 4500 },
  ],
  nails: [
    { name: 'Gel Manicure', duration_minutes: 45, price_cents: 4500 },
    { name: 'Structured Mani', duration_minutes: 60, price_cents: 6000 },
    { name: 'Nail Art', duration_minutes: 90, price_cents: 8000 },
  ],
};

export function sampleServicesForArtist(artistId: string, categoryId?: string | null): Service[] {
  const set = SERVICE_MAP[categoryId ?? ''] ?? SERVICE_MAP.barber;
  return set.map((s, i) => ({ ...s, id: `${artistId}-s${i + 1}`, artist_id: artistId }));
}

export const SAMPLE_MY_SERVICES: Service[] = [
  { id: 's1', artist_id: 'me', name: 'Classic Cut', duration_minutes: 45, price_cents: 3500 },
  { id: 's2', artist_id: 'me', name: 'Skin Fade', duration_minutes: 50, price_cents: 4000 },
  { id: 's3', artist_id: 'me', name: 'Cut + Beard', duration_minutes: 60, price_cents: 5500 },
];

function atDay(daysFromNow: number, time: string): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const [h, m] = time.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const SAMPLE_BOOKINGS: Booking[] = [
  { id: 'b1', customer_id: 'demo', salon_id: 'fade', artist_id: 'ar1', service_id: null, service_name: 'Skin Fade', duration_minutes: 50, price_cents: 4000, customer_name: 'Alex Morgan', customer_phone: '+1 555 0142', starts_at: atDay(2, '14:00'), ends_at: atDay(2, '14:50'), status: 'confirmed', salon_name: 'Fade & Co.', artist_name: 'Marco Rossi', artist_phone: '+1 555 0142', salon_area: 'Downtown · SF' },
  { id: 'b2', customer_id: 'demo', salon_id: 'ink', artist_id: 'ai1', service_id: null, service_name: 'Small Tattoo', duration_minutes: 120, price_cents: 12000, customer_name: 'Alex Morgan', customer_phone: '+1 555 0199', starts_at: atDay(6, '11:00'), ends_at: atDay(6, '13:00'), status: 'confirmed', salon_name: 'Ink Theory', artist_name: 'Lena Voss', artist_phone: '+1 555 0199', salon_area: 'Mission · SF' },
];

export const SAMPLE_SCHEDULE: Booking[] = [
  { id: 'ab1', customer_id: null, salon_id: 'fade', artist_id: 'me', service_id: null, service_name: 'Skin Fade', duration_minutes: 50, price_cents: 4000, customer_name: 'James P.', customer_phone: null, starts_at: atDay(1, '10:00'), ends_at: atDay(1, '10:50'), status: 'confirmed' },
  { id: 'ab2', customer_id: null, salon_id: 'fade', artist_id: 'me', service_id: null, service_name: 'Cut + Beard', duration_minutes: 60, price_cents: 5500, customer_name: 'Omar D.', customer_phone: null, starts_at: atDay(1, '13:00'), ends_at: atDay(1, '14:00'), status: 'confirmed' },
  { id: 'ab3', customer_id: null, salon_id: 'fade', artist_id: 'me', service_id: null, service_name: 'Classic Cut', duration_minutes: 45, price_cents: 3500, customer_name: 'Leo M.', customer_phone: null, starts_at: atDay(2, '11:00'), ends_at: atDay(2, '11:45'), status: 'confirmed' },
];

export const SAMPLE_LOCATIONS: Salon[] = [
  { ...SAMPLE_SALONS[0], id: 'l1', owner_id: 'demo' },
];

export const SAMPLE_TEAM: Artist[] = [
  { ...baseArtist, id: 'ma1', salon_id: 'l1', display_name: 'Marco Rossi', title: 'Master barber', years_experience: 8, rating: 4.9, email: 'marco@fadeco.com' },
  { ...baseArtist, id: 'ma2', salon_id: 'l1', display_name: 'Danny Kim', title: 'Barber', years_experience: 5, rating: 4.8, email: 'danny@fadeco.com' },
];

export const CITIES = ['San Francisco, CA', 'Oakland, CA', 'Berkeley, CA', 'San Jose, CA', 'Palo Alto, CA'];
export const SUB_SERVICES = ['Haircut', 'Beard', 'Color', 'Shave', 'Kids', 'Styling', 'Treatment', 'Wax'];
export const BOOKING_TIMES = ['09:00', '09:30', '10:00', '11:00', '11:30', '13:00', '14:00', '15:00', '16:00'];
export const BUSY_TIMES = ['09:30', '13:00', '16:00'];

/**
 * Available time slots for a given day. Demo data has no real calendar, so
 * availability is derived deterministically from the date — each day shows a
 * different set of open slots. Replace with a query against working_hours +
 * existing bookings when wired to Supabase.
 */
export function slotsForDay(day: Date): { time: string; available: boolean }[] {
  const seed = day.getFullYear() * 366 + (day.getMonth() + 1) * 31 + day.getDate();
  return BOOKING_TIMES.map((time, i) => ({
    time,
    available: (seed + i * 5) % 4 !== 0,
  }));
}
