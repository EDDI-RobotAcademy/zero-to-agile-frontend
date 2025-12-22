import { listingMocks } from '../listings.mock';

export const ownerListingMocks = listingMocks.filter(
  (listing) => listing.ownerId === 'owner-1',
);
