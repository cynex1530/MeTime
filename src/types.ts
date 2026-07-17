export type UserRole = 'customer' | 'artist' | 'manager';
export type Audience = 'him' | 'her' | 'both';
export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  city: string;
};

export type Category = {
  id: string;
  name: string;
  audience: Audience;
  image_url: string | null;
  count?: number; // service count shown on the tile
};

export type Salon = {
  id: string;
  owner_id?: string;
  name: string;
  area: string | null;
  city: string;
  description: string | null;
  audience: Audience;
  tag: string | null;
  cover_image_url: string | null;
  sub_services: string[];
  rating: number;
  reviews_count: number;
  distance?: string; // computed client-side; sample data ships a value
  category_ids?: string[];
};

export type Artist = {
  id: string;
  salon_id: string;
  profile_id: string | null;
  display_name: string;
  title: string | null;
  bio: string | null;
  email: string | null;
  phone?: string | null;
  years_experience: number;
  rating: number;
  photo_url: string | null;
  slot_minutes: number;
  on_vacation: boolean;
};

export type Service = {
  id: string;
  artist_id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
};

export type WorkingHours = {
  id?: string;
  artist_id: string;
  weekday: number; // 0 = Sunday … 6 = Saturday
  opens_at: string; // 'HH:MM'
  closes_at: string;
};

export type TimeOff = {
  id: string;
  artist_id: string;
  starts_on: string; // ISO date
  ends_on: string;
  reason: string | null;
};

export type Booking = {
  id: string;
  customer_id: string | null;
  salon_id: string | null;
  artist_id: string | null;
  service_id: string | null;
  service_name: string;
  duration_minutes: number;
  price_cents: number;
  customer_name: string;
  customer_phone: string | null;
  starts_at: string; // ISO timestamp
  ends_at: string;
  status: BookingStatus;
  // joined display fields
  salon_name?: string;
  artist_name?: string;
  artist_phone?: string | null;
  salon_area?: string;
};
