import { FinderRequestDetail } from '@/types/finder';

export let finderRequestMock: FinderRequestDetail | null = {
  id: 1,                 // 추가: FinderRequestSummary 필수
  finderId: undefined,   // 추가: FinderRequestDetail 필수(값은 undefined 허용)

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

