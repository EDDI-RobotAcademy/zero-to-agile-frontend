import { ContactRequest } from '@/types/contact';
import { listingMocks } from '@/mocks/listings.mock';

const sampleListing = listingMocks[0];

export let tenantContactsMock: ContactRequest[] = [
  {
    id: 'contact-1',
    tenantId: 'tenant-1',
    landlordId: sampleListing.ownerId,
    listingId: sampleListing.id,
    status: 'pending',
    createdAt: '2024-04-01T09:00:00Z',
    landlordPhone: '010-2222-3333',
  },
  {
    id: 'contact-2',
    tenantId: 'tenant-1',
    landlordId: 'landlord-3',
    listingId: 'listing-999',
    status: 'accepted',
    createdAt: '2024-04-10T15:00:00Z',
    landlordPhone: '010-1111-5555',
  },
];
