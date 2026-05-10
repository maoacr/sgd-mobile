import { supabase } from './supabase';

export type BookingType = 'open' | 'tournament' | 'private';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  venue_id: string;
  user_id: string;
  package_id: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  type: BookingType;
  status: BookingStatus;
  team_id: string | null;
  opponent_team: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends Booking {
  venue_name?: string;
  package_name?: string;
  user_name?: string;
}

export const bookings = {
  async list(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async listByUser(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async listByVenue(venueId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('venue_id', venueId)
      .order('booking_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async listByVenueAndDate(
    venueId: string,
    date: string
  ): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('venue_id', venueId)
      .eq('booking_date', date)
      .eq('status', 'confirmed')
      .order('start_time');
    if (error) throw error;
    return data || [];
  },

  async get(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(booking: Partial<Booking>): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    booking: Partial<Booking>
  ): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update(booking)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async confirm(id: string): Promise<Booking> {
    return this.update(id, { status: 'confirmed' });
  },

  async cancel(id: string): Promise<Booking> {
    return this.update(id, { status: 'cancelled' });
  },

  async complete(id: string): Promise<Booking> {
    return this.update(id, { status: 'completed' });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};