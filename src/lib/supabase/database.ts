import { createClient } from './server';
import type { Rental, RentalInsert, RentalUpdate } from '@/lib/types';

const getOwnerId = async (): Promise<string> => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }
    return user.id;
}

export const getRentals = async (): Promise<Rental[]> => {
  const supabase = await createClient();
  const owner_id = await getOwnerId();
  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .eq('owner_id', owner_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rentals:', error);
    throw new Error('Failed to fetch rentals.');
  }
  
  return data || [];
};

export const addRental = async (rental: RentalInsert): Promise<Rental> => {
   const supabase = await createClient();
   const owner_id = await getOwnerId();
   const rentalWithOwner = { ...rental, owner_id };

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
