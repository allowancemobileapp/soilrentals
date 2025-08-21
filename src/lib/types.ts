
export interface Rental {
  id: string;
  user_id: string;
  shop_name: string;
  tenant_name: string | null;
  state: string | null;
  rent_amount: number | null;
  due_date: string | null;
  created_at?: string;
}

// For inserting, we expect user_id to be provided.
export type RentalInsert = Omit<Rental, 'id' | 'created_at'>;
export type RentalUpdate = Partial<Omit<Rental, 'id' | 'created_at' | 'user_id'>>;

export interface Name {
  id: string;
  user_id: string;
  name: string;
  created_at?: string;
}
