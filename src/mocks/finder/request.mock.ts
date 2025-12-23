import { FinderRequestDetail } from '@/types/finder';

export let finderRequestMock: FinderRequestDetail | null = {
  finderRequestId: 1,
  preferredRegion: 'Gangnam-gu',
  houseType: 'APARTMENT',
  priceType: 'JEONSE',
  maxDeposit: 100000000,
  maxRent: 0,
  status: 'Y',
  roomCount: 3,
  bathroomCount: 2,
};
