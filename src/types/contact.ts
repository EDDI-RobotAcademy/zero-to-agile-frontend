export type ContactStatus = 'pending' | 'accepted' | 'rejected';

export interface ContactRequest {
  id: string;
  finderId: string;
  ownerId: string;
  listingId: string;
  status: ContactStatus;
  createdAt: string;
  finderPhone?: string;
  ownerPhone?: string;
}
