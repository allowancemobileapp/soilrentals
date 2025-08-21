'use server';

import { createClient } from './server';
import type { Rental, RentalInsert, RentalUpdate } from '@/lib/types';
import { AuthError } from '@supabase/supabase-js';

export const getRentals = async (): Promise<Rental[]> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new AuthError("User not authenticated for getRentals");
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
  
  return (data as any) || [];
};

export const addRental = async (rental: Omit<RentalInsert, 'owner_id'>): Promise<Rental> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new AuthError("User not authenticated to add a rental");
    }
  
  const rentalWithOwner = {
    ...rental,
    owner_id: user.id,
  };

  const { data, error } = await supabase
    .from('rentals')
    .insert(rentalWithOwner)
    .select()
    .single();

  if (error) {
    console.error('Error adding rental:', error);
    throw new Error(`Failed to add rental: ${error.message}`);
  }
  if (!data) {
    throw new Error('Failed to add rental: No data returned from database.');
  }
  return data as any;
};


export const updateRental = async (id: string, rental: RentalUpdate): Promise<Rental> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new AuthError("User not authenticated to update a rental");
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
  return data as any;
};

export const deleteRental = async (id: string): Promise<void> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new AuthError("User not authenticated to delete a rental");
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
