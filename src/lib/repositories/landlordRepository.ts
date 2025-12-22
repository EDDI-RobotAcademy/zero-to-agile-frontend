import { Listing } from '@/types/listing';
import { ContactRequest } from '@/types/contact';
import { TenantRequestDetail } from '@/types/tenant';
import {
  createListing,
  getListingById,
  listLandlordListings,
} from './listingRepository';
import { getTenantRequestById } from './tenantRepository';
import { addContact, getContactsByLandlord } from './contactStore';

export async function getLandlordListings(landlordId: string): Promise<Listing[]> {
  return listLandlordListings(landlordId);
}

export async function getLandlordListingDetail(id: string): Promise<Listing | null> {
  return getListingById(id);
}

export async function createLandlordListing(
  payload: Omit<Listing, 'id' | 'createdAt'>,
): Promise<Listing> {
  return createListing(payload);
}

export async function getMatchesForListing(
  listingId: string,
): Promise<{ tenant: TenantRequestDetail; matchScore: number }[]> {
  const tenantRequest = await getTenantRequestById(1);
  if (!tenantRequest) return [];
  return [{ tenant: tenantRequest, matchScore: 92 }];
}

export async function sendContactRequest(
  tenantId: string,
  listingId: string,
  landlordId: string,
): Promise<ContactRequest> {
  const newContact: ContactRequest = {
    id: `landlord-contact-${Date.now()}`,
    tenantId,
    landlordId,
    listingId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    landlordPhone: '010-0000-0000',
  };
  return addContact(newContact);
}

export async function getLandlordContacts(landlordId: string): Promise<ContactRequest[]> {
  return getContactsByLandlord(landlordId);
}
