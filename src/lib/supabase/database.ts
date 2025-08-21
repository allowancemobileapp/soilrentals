"use server";

import { supabase } from './client';
import type { Rental, RentalInsert, RentalUpdate, Name } from '@/lib/types';

// --- NAMES TEST FUNCTIONS ---

export const getNamesForUser = async (userId: string): Promise<Name[]> => {
  const { data, error } = await supabase
    .from('names')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching names:', error);
    throw new Error('Failed to fetch names.');
  }
  
  return data || [];
};

export const addNameToUser = async (userId: string, name: string): Promise<Name> => {
  const nameWithUser = {
    name,
    user_id: userId,
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

export const getRentalsForUser = async (userId: string): Promise<Rental[]> => {
  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rentals:', error);
    throw new Error('Failed to fetch rentals.');
  }
  
  return data || [];
};

export const addRental = async (userId: string, rental: Omit<RentalInsert, 'user_id'>): Promise<Rental> => {
  const rentalWithUser = {
    ...rental,
    user_id: userId,
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
