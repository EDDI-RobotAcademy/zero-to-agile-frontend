import { listingMocks } from '../listings.mock';

export const landlordListingMocks = listingMocks.filter(
  (listing) => listing.ownerId === 'landlord-1',
);
