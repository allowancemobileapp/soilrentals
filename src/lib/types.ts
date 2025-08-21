export interface Rental {
  id: string;
  user_id: string;
  shop_name: string;
  tenant_name: string | null;
  state: string | null;
  rent_amount: number | null;
  due_date: string;
  created_at?: string;
}

export type RentalInsert = Omit<Rental, 'id' | 'created_at'>;
export type RentalUpdate = Partial<Omit<Rental, 'id' | 'created_at' | 'user_id'>>;
