import {
  FinderRequestDetail,
  FinderRequestStatus,
  HouseType,
  PriceType,
} from '@/types/finder';

type FinderRequestMock = FinderRequestDetail & {
  finder_request_id: number;
  preferred_region: string;
  price_type: PriceType;
  max_deposit: number;
  max_rent: number;
  house_type: HouseType;
  status: FinderRequestStatus;
  finder_id?: string;
};

export let finderRequestMock: FinderRequestMock | null = {
  id: 1,
  finderId: undefined,
  finder_id: undefined,

  finderRequestId: 1,
  finder_request_id: 1,
  preferredRegion: 'Gangnam-gu',
  preferred_region: 'Gangnam-gu',
  houseType: 'APARTMENT',
  house_type: 'APARTMENT',
  priceType: 'JEONSE',
  price_type: 'JEONSE',
  maxDeposit: 100000000,
  max_deposit: 100000000,
  maxRent: 0,
  max_rent: 0,
  status: 'Y',
  roomCount: 3,
  bathroomCount: 2,
};
