
'use server';

import { createClient } from './server';
import type { Rental, RentalInsert, RentalUpdate, Name } from '@/lib/types';
import { AuthError } from '@supabase/supabase-js';

// --- NAMES TEST FUNCTIONS ---

export const getNames = async (): Promise<Name[]> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('names')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching names:', error);
    throw new Error('Failed to fetch names.');
  }
  
  return data || [];
};

export const addName = async (name: string): Promise<Name> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError("User not authenticated. Please log in again.");
  }
  
  const nameWithUser = {
    name,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from('names')
    .insert(nameWithUser)
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error (addName):', error);
    throw new Error(`Database error: ${error.message}`);
  }
  
  if (!data) {
    throw new Error('Failed to create name: No data returned from database.');
  }

  return data;
};


// --- RENTAL FUNCTIONS ---

export const getRentals = async (): Promise<Rental[]> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rentals:', error);
    throw new Error('Failed to fetch rentals.');
  }
  
  return data || [];
};

export const addRental = async (rental: RentalInsert): Promise<Rental> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError("User not authenticated. Please log in again.");
  }
  
  const rentalWithUser = {
    ...rental,
    user_id: user.id,
    due_date: rental.due_date || null,
  };

  const { data, error } = await supabase
    .from('rentals')
    .insert(rentalWithUser)
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error (addRental):', error);
    throw new Error(`Database error: ${error.message}`);
  }
  
  if (!data) {
    throw new Error('Failed to create rental: No data returned from database.');
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
    .eq('user_id', user.id)
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
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting rental:', error);
    throw new Error('Failed to delete rental.');
  }
};
