export interface Rental {
  id: string;
  owner_id: string;
  shop_name: string;
  tenant_name: string;
  state: string;
  city?: string | null;
  address?: string | null;
  rent_amount: number;
  start_date: string;
  due_date: string;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  status: 'active' | 'terminated';
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type RentalInsert = Omit<Rental, 'id' | 'created_at' | 'updated_at'>;
export type RentalUpdate = Partial<Omit<Rental, 'id' | 'created_at' | 'updated_at'>>;
