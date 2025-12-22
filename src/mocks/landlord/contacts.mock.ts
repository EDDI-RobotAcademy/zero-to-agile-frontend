import { ContactRequest } from '@/types/contact';

export let landlordContactsMock: ContactRequest[] = [
  {
    id: 'landlord-contact-1',
    tenantId: 'tenant-1',
    landlordId: 'landlord-1',
    listingId: 'listing-1',
    status: 'pending',
    createdAt: '2024-04-18T11:00:00Z',
    tenantPhone: undefined,
    landlordPhone: '010-9999-9999',
  },
];
