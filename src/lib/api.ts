/**
 * Data access layer. Every read tries Supabase first and falls back to the
 * bundled sample data when the client is unconfigured, errors, or is empty —
 * so the app always renders the design.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SAMPLE_ARTISTS,
  SAMPLE_BOOKINGS,
  SAMPLE_CATEGORIES,
  SAMPLE_LOCATIONS,
  SAMPLE_MY_SERVICES,
  SAMPLE_SALONS,
  SAMPLE_SCHEDULE,
  SAMPLE_TEAM,
  sampleArtistsForSalon,
  sampleServicesForArtist,
} from './sampleData';
import { supabase } from './supabase';
import { Artist, Audience, Booking, Category, Salon, Service } from '../types';

export async function fetchCategories(audience: 'him' | 'her' | 'anyone'): Promise<Category[]> {
  let rows: Category[] = SAMPLE_CATEGORIES;
  if (supabase) {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    if (data?.length) {
      const counts = SAMPLE_CATEGORIES.reduce<Record<string, number>>((m, c) => {
        m[c.id] = c.count ?? 0;
        return m;
      }, {});
      rows = data.map((c) => ({ ...c, count: counts[c.id] }));
    }
  }
  if (audience === 'anyone') return rows;
  return rows.filter((c) => c.audience === audience || c.audience === 'both');
}

export async function fetchSalons(categoryId: string): Promise<Salon[]> {
  if (supabase) {
    const { data } = await supabase
      .from('salons')
      .select('*, salon_categories!inner(category_id)')
      .eq('salon_categories.category_id', categoryId)
      .eq('is_active', true);
    if (data?.length) return data as Salon[];
  }
  return SAMPLE_SALONS.filter((s) => s.category_ids?.includes(categoryId));
}

export async function fetchSalon(id: string): Promise<Salon | null> {
  if (supabase) {
    const { data } = await supabase.from('salons').select('*').eq('id', id).maybeSingle();
    if (data) return data as Salon;
  }
  return SAMPLE_SALONS.find((s) => s.id === id) ?? null;
}

/** Search salons by name / tag / area / sub-service for the Home search bar. */
export async function searchSalons(query: string): Promise<Salon[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  if (supabase) {
    const { data } = await supabase
      .from('salons')
      .select('*')
      .or(`name.ilike.%${q}%,tag.ilike.%${q}%,area.ilike.%${q}%`)
      .eq('is_active', true)
      .limit(25);
    if (data?.length) return data as Salon[];
    if (data) return [];
  }
  return SAMPLE_SALONS.filter((s) =>
    [s.name, s.tag, s.area, ...(s.sub_services ?? [])]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(q))
  );
}

export async function fetchSalonArtists(salonId: string): Promise<Artist[]> {
  if (supabase) {
    const { data } = await supabase
      .from('artists')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true);
    if (data?.length) return data as Artist[];
  }
  return sampleArtistsForSalon(salonId);
}

export async function fetchArtistById(id: string): Promise<Artist | null> {
  if (supabase) {
    const { data } = await supabase.from('artists').select('*').eq('id', id).maybeSingle();
    if (data) return data as Artist;
  }
  return (
    SAMPLE_ARTISTS.find((a) => a.id === id) ??
    sampleArtistsForSalon('fade').find((a) => a.id === id) ??
    null
  );
}

export async function fetchArtistServices(artistId: string, categoryId?: string | null): Promise<Service[]> {
  if (supabase) {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('artist_id', artistId)
      .eq('is_active', true);
    if (data?.length) return data as Service[];
  }
  return sampleServicesForArtist(artistId, categoryId);
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

// Bookings finished locally in demo mode (so they disappear from the list too)
const localCompleted = new Set<string>();

// (customer, artist) pairs already reviewed — so we never ask the same customer
// to review the same artist twice. Persisted to the phone (AsyncStorage) so the
// rule survives app restarts, and kept in a Set as an in-memory cache.
const REVIEWED_KEY = 'mtReviewedPairs';
const reviewedPairs = new Set<string>();
const pairKey = (customerId: string, artistId: string) => `${customerId}:${artistId}`;

let reviewedLoaded = false;
async function loadReviewedPairs(): Promise<void> {
  if (reviewedLoaded) return;
  reviewedLoaded = true;
  try {
    const raw = await AsyncStorage.getItem(REVIEWED_KEY);
    if (raw) (JSON.parse(raw) as string[]).forEach((k) => reviewedPairs.add(k));
  } catch {
    // ignore — start empty if storage is unreadable
  }
}
async function persistReviewedPairs(): Promise<void> {
  try {
    await AsyncStorage.setItem(REVIEWED_KEY, JSON.stringify([...reviewedPairs]));
  } catch {
    // ignore — dedup still holds for this session via the in-memory Set
  }
}

/** Record that this customer has reviewed this artist (persisted to the phone). */
async function markReviewed(customerId: string, artistId: string): Promise<void> {
  await loadReviewedPairs();
  reviewedPairs.add(pairKey(customerId, artistId));
  await persistReviewedPairs();
}

/**
 * Has this customer already left a review for this artist? Used to suppress the
 * review prompt/notification for an artist the customer has reviewed before.
 * A different artist is asked independently.
 */
export async function hasReviewedArtist(customerId: string, artistId: string | null): Promise<boolean> {
  if (!customerId || !artistId) return false;
  await loadReviewedPairs();
  if (reviewedPairs.has(pairKey(customerId, artistId))) return true;
  if (supabase) {
    const { data } = await supabase
      .from('reviews')
      .select('id')
      .eq('customer_id', customerId)
      .eq('artist_id', artistId)
      .limit(1);
    if (data?.length) {
      // cache the server's answer on the phone too
      await markReviewed(customerId, artistId);
      return true;
    }
  }
  return false;
}

export async function fetchMyBookings(customerId: string): Promise<Booking[]> {
  if (supabase) {
    const { data } = await supabase
      .from('bookings')
      .select('*, salons(name, area), artists(display_name, phone)')
      .eq('customer_id', customerId)
      .eq('status', 'confirmed')
      .order('starts_at');
    if (data?.length) {
      return data.map((b: any) => ({
        ...b,
        salon_name: b.salons?.name,
        salon_area: b.salons?.area,
        artist_name: b.artists?.display_name,
        artist_phone: b.artists?.phone,
      }));
    }
    if (data) return [];
  }
  return SAMPLE_BOOKINGS.filter((b) => !localCompleted.has(b.id));
}

/** Save a review and mark the booking done (it then leaves the customer list). */
export async function finishBooking(
  booking: Booking,
  rating: number,
  comment: string,
  customerId: string,
  customerName: string
): Promise<void> {
  const isUuid = /^[0-9a-f-]{36}$/i.test(booking.id);
  if (supabase && isUuid) {
    await supabase.from('reviews').insert({
      booking_id: booking.id,
      customer_id: customerId,
      customer_name: customerName || null,
      salon_id: booking.salon_id,
      artist_id: booking.artist_id,
      rating,
      comment: comment.trim() || null,
    });
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', booking.id);
  } else {
    localCompleted.add(booking.id);
  }
  // Remember (and persist to the phone) that this customer reviewed this artist.
  if (booking.artist_id) await markReviewed(customerId, booking.artist_id);
}

export type ArtistReview = { rating: number; comment: string | null; customer_name: string | null; created_at: string };

/** An artist's reviews, most recent first — for the personal dashboard. */
export async function fetchArtistReviews(artistId: string | null): Promise<ArtistReview[]> {
  if (supabase && artistId) {
    const { data } = await supabase
      .from('reviews')
      .select('rating, comment, customer_name, created_at')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });
    if (data) return data as ArtistReview[];
  }
  return [];
}

export async function createBooking(booking: Omit<Booking, 'id' | 'status'>): Promise<Booking> {
  if (supabase) {
    const { salon_name, artist_name, salon_area, ...row } = booking;
    const { data, error } = await supabase.from('bookings').insert(row).select().single();
    if (!error && data) return { ...booking, ...data };
  }
  return { ...booking, id: `local-${Date.now()}`, status: 'confirmed' };
}

export async function cancelBooking(id: string): Promise<void> {
  if (supabase) await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
}

export async function rescheduleBooking(id: string, startsAt: string, endsAt: string): Promise<void> {
  if (supabase) {
    await supabase.from('bookings').update({ starts_at: startsAt, ends_at: endsAt }).eq('id', id);
  }
}

// ---------------------------------------------------------------------------
// Artist / worker
// ---------------------------------------------------------------------------

export async function fetchMyArtistRow(profileId: string): Promise<Artist | null> {
  if (supabase) {
    const { data } = await supabase.from('artists').select('*').eq('profile_id', profileId).maybeSingle();
    if (data) return data as Artist;
  }
  return null;
}

export async function fetchArtistSchedule(artistId: string | null): Promise<Booking[]> {
  if (supabase && artistId) {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('artist_id', artistId)
      .eq('status', 'confirmed')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at');
    if (data) return data as Booking[];
  }
  return SAMPLE_SCHEDULE;
}

/** All of an artist's bookings (any status/date) — for the dashboard stats. */
export async function fetchArtistAllBookings(artistId: string | null): Promise<Booking[]> {
  if (supabase && artistId) {
    const { data } = await supabase.from('bookings').select('*').eq('artist_id', artistId);
    if (data) return data as Booking[];
  }
  return [];
}

/**
 * Bookings backing the dashboard: salon-wide for a manager (all their salons),
 * or the pro's own bookings for an artist. Reads straight from the database.
 */
export async function fetchStatsBookings(profile: { id: string; role: string }): Promise<Booking[]> {
  if (!supabase) return [];

  if (profile.role === 'manager') {
    const locs = await fetchMyLocations(profile.id);
    const salonIds = locs.map((l) => l.id).filter((id) => id && !id.startsWith('local') && id !== 'l1');
    if (salonIds.length) {
      const { data } = await supabase.from('bookings').select('*').in('salon_id', salonIds);
      if (data && data.length) return data as Booking[];
    }
  }

  const artist = await fetchMyArtistRow(profile.id);
  if (artist) {
    const { data } = await supabase.from('bookings').select('*').eq('artist_id', artist.id);
    return (data as Booking[]) ?? [];
  }
  return [];
}

export async function fetchMyServices(artistId: string | null): Promise<Service[]> {
  if (supabase && artistId) {
    const { data } = await supabase.from('services').select('*').eq('artist_id', artistId).eq('is_active', true);
    if (data?.length) return data as Service[];
  }
  return SAMPLE_MY_SERVICES;
}

export async function upsertService(service: Partial<Service> & { artist_id: string }): Promise<void> {
  if (supabase && !service.artist_id.startsWith('me')) {
    await supabase.from('services').upsert(service);
  }
}

export async function deleteService(id: string): Promise<void> {
  if (supabase && !id.includes('-s') && !id.startsWith('s')) {
    await supabase.from('services').update({ is_active: false }).eq('id', id);
  }
}

// ---------------------------------------------------------------------------
// Manager
// ---------------------------------------------------------------------------

export async function fetchMyLocations(ownerId: string): Promise<Salon[]> {
  if (supabase) {
    const { data } = await supabase.from('salons').select('*').eq('owner_id', ownerId).eq('is_active', true);
    if (data?.length) return data as Salon[];
  }
  return SAMPLE_LOCATIONS;
}

/**
 * The owner is also a bookable pro. Assign them to one of their salons by
 * upserting their own artist row (linked to their profile).
 */
export async function assignSelfToSalon(
  profileId: string,
  salonId: string,
  displayName: string,
  email: string | null
): Promise<void> {
  if (!supabase) return;
  const { data: existing } = await supabase
    .from('artists')
    .select('id')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (existing) {
    await supabase.from('artists').update({ salon_id: salonId }).eq('id', existing.id);
  } else {
    await supabase.from('artists').insert({
      salon_id: salonId,
      profile_id: profileId,
      display_name: displayName || 'Owner',
      email,
      title: 'Owner',
    });
  }
}

/** Everything the Salon Dashboard needs for one or more salons. */
export async function fetchSalonAnalyticsData(
  salonIds: string[]
): Promise<{ bookings: Booking[]; artists: Artist[]; reviews: any[] }> {
  if (!supabase || !salonIds.length) return { bookings: [], artists: [], reviews: [] };
  const [b, a, r] = await Promise.all([
    supabase.from('bookings').select('*').in('salon_id', salonIds),
    supabase.from('artists').select('*').in('salon_id', salonIds),
    supabase.from('reviews').select('*').in('salon_id', salonIds),
  ]);
  return {
    bookings: (b.data as Booking[]) ?? [],
    artists: (a.data as Artist[]) ?? [],
    reviews: r.data ?? [],
  };
}

export async function fetchMyTeam(salonIds: string[]): Promise<Artist[]> {
  if (supabase && salonIds.length && !salonIds.includes('l1')) {
    const { data } = await supabase.from('artists').select('*').in('salon_id', salonIds).eq('is_active', true);
    if (data?.length) return data as Artist[];
  }
  return SAMPLE_TEAM;
}
