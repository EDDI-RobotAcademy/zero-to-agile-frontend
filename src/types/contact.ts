export type ContactStatus = 'pending' | 'accepted' | 'rejected';

export interface ContactRequest {
  id: string;
  tenantId: string;
  landlordId: string;
  listingId: string;
  status: ContactStatus;
  createdAt: string;
  tenantPhone?: string;
  landlordPhone?: string;
}
