export interface Rental {
  id: string;
  shopName: string;
  tenantName: string;
  state: string;
  monthlyRent: number;
  dueDate: Date;
  propertyType: 'apartment' | 'house' | 'shop' | 'office';
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  description: string;
}

export type PropertyType = Rental['propertyType'];
