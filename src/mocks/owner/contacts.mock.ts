import { ContactRequest } from '@/types/contact';

export let ownerContactsMock: ContactRequest[] = [
  {
    id: 'owner-contact-1',
    finderId: 'finder-1',
    ownerId: 'owner-1',
    listingId: 'listing-1',
    status: 'pending',
    createdAt: '2024-04-18T11:00:00Z',
    finderPhone: undefined,
    ownerPhone: '010-9999-9999',
  },
];
