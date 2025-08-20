import { supabase } from './client';
import type { Rental, RentalInsert, RentalUpdate } from '@/lib/types';

// Temporarily use a hardcoded owner_id for development
// In a real app, this would come from the authenticated user
const FAKE_OWNER_ID = '12345';

export const getRentals = async (): Promise<Rental[]> => {
  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .eq('owner_id', FAKE_OWNER_ID)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rentals:', error);
    throw new Error('Failed to fetch rentals.');
  }
  
  // Note: Supabase returns date/time strings in ISO 8601 format.
  // The frontend components expect Date objects or string formats they can parse.
  // We'll handle date conversion in the components themselves.
  return data || [];
};

export const addRental = async (rental: RentalInsert): Promise<Rental> => {
   const rentalWithOwner = { ...rental, owner_id: FAKE_OWNER_ID };

  const { data, error } = await supabase
    .from('rentals')
    .insert([rentalWithOwner])
    .select()
    .single();

  if (error) {
    console.error('Error adding rental:', error);
    throw new Error('Failed to add rental.');
  }
  return data;
};


export const updateRental = async (id: string, rental: RentalUpdate): Promise<Rental> => {
  const { data, error } = await supabase
    .from('rentals')
    .update(rental)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating rental:', error);
    throw new Error('Failed to update rental.');
  }
  return data;
};

export const deleteRental = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('rentals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting rental:', error);
    throw new Error('Failed to delete rental.');
  }
};
