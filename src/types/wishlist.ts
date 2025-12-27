export interface WishlistItem {
  wishlistId: number;
  housePlatformId: number;
  houseTitle: string;
  address: string;
  salesType: string;
  deposit: number;
  monthlyRent?: number;
  roomType: string;
  area?: number;
  floor?: number;
  imageUrl?: string;
  createdAt: string;
}
