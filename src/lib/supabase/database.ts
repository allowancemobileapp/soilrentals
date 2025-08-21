'use server';

import { createClient } from './server';
import type { Rental, RentalInsert, RentalUpdate } from '@/lib/types';
import { AuthError } from '@supabase/supabase-js';

export const getRentals = async (): Promise<Rental[]> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // This will be handled by middleware, but as a safeguard:
    return [];
  }

  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rentals:', error);
    throw new Error('Failed to fetch rentals.');
  }
  
  return data || [];
};

export const addRental = async (rental: Omit<RentalInsert, 'owner_id'>): Promise<Rental> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError("User not authenticated. Please log in again.");
  }
  
  const rentalWithOwner: RentalInsert = {
    ...rental,
    owner_id: user.id, // Explicitly set the owner_id
    start_date: new Date(rental.start_date).toISOString().split('T')[0],
    due_date: new Date(rental.due_date).toISOString().split('T')[0],
  };

  const { data, error } = await supabase
    .from('rentals')
    .insert(rentalWithOwner)
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    // This will now properly throw the error to the client
    throw new Error(`Database error: ${error.message}`);
  }

  if (!data) {
    // This case handles if the insert succeeds but returns no data
    throw new Error('Failed to add rental: No data returned from database.');
  }
  
  return data;
};


export const updateRental = async (id: string, rental: RentalUpdate): Promise<Rental> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new AuthError("User not authenticated to update a rental. Please log in again.");
  }

  const { data, error } = await supabase
    .from('rentals')
    .update(rental)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating rental:', error);
    throw new Error('Failed to update rental.');
  }
  return data;
};

export const deleteRental = async (id: string): Promise<void> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError("User not authenticated to delete a rental. Please log in again.");
  }

  const { error } = await supabase
    .from('rentals')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) {
    console.error('Error deleting rental:', error);
    throw new Error('Failed to delete rental.');
  }
};
