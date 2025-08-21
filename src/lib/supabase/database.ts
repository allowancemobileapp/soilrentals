'use server';

import { createClient } from './server';
import type { Rental, RentalInsert, RentalUpdate } from '@/lib/types';

const ensureAuthenticated = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }
    return user;
}

export const getRentals = async (): Promise<Rental[]> => {
  await ensureAuthenticated();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rentals:', error);
    throw new Error('Failed to fetch rentals.');
  }
  
  return data || [];
};

export const addRental = async (rental: RentalInsert): Promise<Rental> => {
  const user = await ensureAuthenticated();
  const supabase = await createClient();
  
  const rentalWithOwner = {
    ...rental,
    user_id: user.id,
  };

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
  await ensureAuthenticated();
  const supabase = await createClient();
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
  await ensureAuthenticated();
  const supabase = await createClient();
  const { error } = await supabase
    .from('rentals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting rental:', error);
    throw new Error('Failed to delete rental.');
  }
};