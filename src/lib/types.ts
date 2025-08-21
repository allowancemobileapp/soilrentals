export interface Rental {
  id: string;
  owner_id: string;
  shop_name: string;
  tenant_name: string;
  state: string;
  city?: string | null;
  address?: string | null;
  rent_amount: number;
  due_date: string; // Should be a string in ISO format
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  status: 'active' | 'terminated';
  notes?: string | null;
  created_at?: string;
  updated_at?: string;

  // Fields from old schema that are in the form but not in the DB
  // These will be part of the form state but not part of the final DB insert
  property_type: 'apartment' | 'house' | 'shop' | 'office';
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  description: string;
  rental_type: 'monthly' | 'yearly';
}

export type RentalInsert = Omit<Rental, 'id' | 'created_at' | 'updated_at' | 'owner_id' | 'property_type' | 'bedrooms' | 'bathrooms' | 'square_footage' | 'description' | 'rental_type'> & {
  shop_name: string;
  tenant_name: string;
  state: string;
  rent_amount: number;
  due_date: string;
  owner_id: string;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'custom';
};
export type RentalUpdate = Partial<Omit<Rental, 'id' | 'created_at' | 'updated_at' | 'owner_id'>>;
