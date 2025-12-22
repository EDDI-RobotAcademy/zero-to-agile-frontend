export type ContractType = 'jeonse' | 'sale';

export type ListingType = 'apartment' | 'officetel' | 'villa' | 'house' | 'commercial';

export interface Listing {
  id: string;
  title: string;
  region: string; // e.g., "서울시"
  district: string; // e.g., "마포구"
  type: ListingType;
  contractType: ContractType;
  price: number; // 보증금 or 매매가
  area: number; // m2 기준
  rooms: number;
  bathrooms: number;
  floor: number;
  options?: string[];
  images: string[];
  description: string;
  aiDescription?: string;
  ownerId: string;
  createdAt: string;
  status?: 'active' | 'inactive';
}
