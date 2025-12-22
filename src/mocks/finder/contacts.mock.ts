import { ContactRequest } from '@/types/contact';
import { listingMocks } from '@/mocks/listings.mock';

const sampleListing = listingMocks[0];

export let finderContactsMock: ContactRequest[] = [
  {
    id: 'contact-1',
    finderId: 'finder-1',
    ownerId: sampleListing.ownerId,
    listingId: sampleListing.id,
    status: 'pending',
    createdAt: '2024-04-01T09:00:00Z',
    ownerPhone: '010-2222-3333',
  },
  {
    id: 'contact-2',
    finderId: 'finder-1',
    ownerId: 'owner-3',
    listingId: 'listing-999',
    status: 'accepted',
    createdAt: '2024-04-10T15:00:00Z',
    ownerPhone: '010-1111-5555',
  },
];
