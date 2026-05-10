import { supabase } from './supabase';

export type VenueType = 'futsal' | 'fut7' | 'fut9' | 'fut11';
export type SurfaceType = 'sintetica' | 'híbrida' | 'natural';

export interface Venue {
  id: string;
  admin_id: string;
  name: string;
  type: VenueType;
  surface: SurfaceType;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  capacity: number;
  has_roof: boolean;
  has_lights: boolean;
  has_graderia: boolean;
  has_bathrooms: boolean;
  has_parking: boolean;
  opens_at: string;
  closes_at: string;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VenueAmenity {
  id: string;
  venue_id: string;
  name: string;
  icon: string | null;
}

export interface VenuePhoto {
  id: string;
  venue_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
}

export interface VenuePackage {
  id: string;
  venue_id: string;
  name: string;
  description: string | null;
  duration_min: number;
  price: number;
  is_promotion: boolean;
  valid_from: string | null;
  valid_until: string | null;
  valid_days: number[] | null;
  is_active: boolean;
  created_at: string;
}

export interface VenueSlot {
  id: string;
  venue_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface VenueWithDetails extends Venue {
  amenities: VenueAmenity[];
  photos: VenuePhoto[];
  packages: VenuePackage[];
}

export const venues = {
  async list(): Promise<Venue[]> {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async listByAdmin(adminId: string): Promise<Venue[]> {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('admin_id', adminId)
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async get(id: string): Promise<Venue | null> {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getWithDetails(id: string): Promise<VenueWithDetails | null> {
    const [venue, amenities, photos, packages] = await Promise.all([
      this.get(id),
      supabase.from('venue_amenities').select('*').eq('venue_id', id),
      supabase.from('venue_photos').select('*').eq('venue_id', id).order('sort_order'),
      supabase.from('venue_packages').select('*').eq('venue_id', id).eq('is_active', true),
    ]);

    if (!venue) return null;

    return {
      ...venue,
      amenities: amenities.data || [],
      photos: photos.data || [],
      packages: packages.data || [],
    };
  },

  async create(venue: Partial<Venue>): Promise<Venue> {
    const { data, error } = await supabase
      .from('venues')
      .insert(venue)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, venue: Partial<Venue>): Promise<Venue> {
    const { data, error } = await supabase
      .from('venues')
      .update(venue)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('venues')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
  },
};

export const venueAmenities = {
  async list(venueId: string): Promise<VenueAmenity[]> {
    const { data, error } = await supabase
      .from('venue_amenities')
      .select('*')
      .eq('venue_id', venueId);
    if (error) throw error;
    return data || [];
  },

  async create(amenity: Partial<VenueAmenity>): Promise<VenueAmenity> {
    const { data, error } = await supabase
      .from('venue_amenities')
      .insert(amenity)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('venue_amenities')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const venuePhotos = {
  async list(venueId: string): Promise<VenuePhoto[]> {
    const { data, error } = await supabase
      .from('venue_photos')
      .select('*')
      .eq('venue_id', venueId)
      .order('sort_order');
    if (error) throw error;
    return data || [];
  },

  async create(photo: Partial<VenuePhoto>): Promise<VenuePhoto> {
    const { data, error } = await supabase
      .from('venue_photos')
      .insert(photo)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('venue_photos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const venuePackages = {
  async list(venueId: string): Promise<VenuePackage[]> {
    const { data, error } = await supabase
      .from('venue_packages')
      .select('*')
      .eq('venue_id', venueId)
      .eq('is_active', true);
    if (error) throw error;
    return data || [];
  },

  async create(pkg: Partial<VenuePackage>): Promise<VenuePackage> {
    const { data, error } = await supabase
      .from('venue_packages')
      .insert(pkg)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, pkg: Partial<VenuePackage>): Promise<VenuePackage> {
    const { data, error } = await supabase
      .from('venue_packages')
      .update(pkg)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('venue_packages')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
  },
};

export const venueSlots = {
  async list(venueId: string, date: string): Promise<VenueSlot[]> {
    const { data, error } = await supabase
      .from('venue_slots')
      .select('*')
      .eq('venue_id', venueId)
      .eq('date', date)
      .order('start_time');
    if (error) throw error;
    return data || [];
  },

  async getAvailable(venueId: string, date: string): Promise<VenueSlot[]> {
    const { data, error } = await supabase
      .from('venue_slots')
      .select('*')
      .eq('venue_id', venueId)
      .eq('date', date)
      .eq('is_available', true)
      .order('start_time');
    if (error) throw error;
    return data || [];
  },

  async create(slot: Partial<VenueSlot>): Promise<VenueSlot> {
    const { data, error } = await supabase
      .from('venue_slots')
      .insert(slot)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAvailability(
    id: string,
    isAvailable: boolean
  ): Promise<VenueSlot> {
    const { data, error } = await supabase
      .from('venue_slots')
      .update({ is_available: isAvailable })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async bulkCreate(slots: Partial<VenueSlot>[]): Promise<VenueSlot[]> {
    const { data, error } = await supabase
      .from('venue_slots')
      .insert(slots)
      .select();
    if (error) throw error;
    return data || [];
  },
};