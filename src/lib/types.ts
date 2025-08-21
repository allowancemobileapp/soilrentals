export interface Rental {
  id: string;
  user_id: string;
  shop_name: string;
  tenant_name: string;
  state: string;
  rent_amount: number;
  rental_type: 'monthly' | 'yearly';
  due_date: string;
  property_type: 'apartment' | 'house' | 'shop' | 'office';
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  description: string;
  created_at?: string;
}

export type PropertyType = Rental['property_type'];
export type RentalType = Rental['rental_type'];

export type RentalInsert = Omit<Rental, 'id' | 'created_at' | 'user_id'>;
export type RentalUpdate = Partial<Omit<Rental, 'id' | 'created_at' | 'user_id'>>;