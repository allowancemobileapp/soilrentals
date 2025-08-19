export interface Rental {
  id: string;
  shopName: string;
  tenantName: string;
  state: string;
  rentAmount: number;
  rentalType: 'monthly' | 'yearly';
  dueDate: Date;
  propertyType: 'apartment' | 'house' | 'shop' | 'office';
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  description: string;
}

export type PropertyType = Rental['propertyType'];
export type RentalType = Rental['rentalType'];
