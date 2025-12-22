import { Listing } from '@/types/listing';
import { ContactRequest } from '@/types/contact';
import { FinderRequestDetail } from '@/types/finder';
import {
  createListing,
  getListingById,
  listOwnerListings,
} from './listingRepository';
import { getFinderRequestById } from './finderRepository';
import { addContact, getContactsByOwner } from './contactStore';

export async function getOwnerListings(ownerId: string): Promise<Listing[]> {
  return listOwnerListings(ownerId);
}

export async function getOwnerListingDetail(id: string): Promise<Listing | null> {
  return getListingById(id);
}

export async function createOwnerListing(
  payload: Omit<Listing, 'id' | 'createdAt'>,
): Promise<Listing> {
  return createListing(payload);
}

export async function getMatchesForListing(
  listingId: string,
): Promise<{ finder: FinderRequestDetail; matchScore: number }[]> {
  const finderRequest = await getFinderRequestById(1);
  if (!finderRequest) return [];
  return [{ finder: finderRequest, matchScore: 92 }];
}

export async function sendContactRequest(
  finderId: string,
  listingId: string,
  ownerId: string,
): Promise<ContactRequest> {
  const newContact: ContactRequest = {
    id: `owner-contact-${Date.now()}`,
    finderId,
    ownerId,
    listingId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ownerPhone: '010-0000-0000',
  };
  return addContact(newContact);
}

export async function getOwnerContacts(ownerId: string): Promise<ContactRequest[]> {
  return getContactsByOwner(ownerId);
}
