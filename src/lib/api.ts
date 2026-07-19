/**
 * Data access layer. Every read tries Supabase first and falls back to the
 * bundled sample data when the client is unconfigured, errors, or is empty —
 * so the app always renders the design.
 */
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

export async function fetchMyBookings(customerId: string): Promise<Booking[]> {
  if (supabase) {
    const { data } = await supabase
      .from('bookings')
      .select('*, salons(name, area), artists(display_name, phone)')
      .eq('customer_id', customerId)
      .neq('status', 'cancelled')
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
  return SAMPLE_BOOKINGS;
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

export async function fetchMyTeam(salonIds: string[]): Promise<Artist[]> {
  if (supabase && salonIds.length && !salonIds.includes('l1')) {
    const { data } = await supabase.from('artists').select('*').in('salon_id', salonIds).eq('is_active', true);
    if (data?.length) return data as Artist[];
  }
  return SAMPLE_TEAM;
}
