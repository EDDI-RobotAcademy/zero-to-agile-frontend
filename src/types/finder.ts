import {
  HOUSE_TYPE_LABEL,
  PRICE_TYPE_LABEL,
  STATUS_LABEL,
} from "./finder.constants";

export type HouseType = keyof typeof HOUSE_TYPE_LABEL;
export type PriceType = keyof typeof PRICE_TYPE_LABEL;
export type FinderRequestStatus = keyof typeof STATUS_LABEL;

export interface FinderProfile {
  id: string;
  nickname: string;
  phone?: string;
}

export interface FinderRequestSummary {
  id: number;
  finderRequestId: number;
  preferredRegion: string;
  priceType: PriceType;
  maxDeposit: number;
  maxRent: number;
  houseType: HouseType;
  status: FinderRequestStatus;
}

export interface FinderRequestDetail extends FinderRequestSummary {
  finderId: string | undefined;
  area?: number;
  budget?: number;
  dealType?: string;
  residenceType?: string;
  preferredArea?: string;
  createdAt?: string;
  updatedAt?: string;
  additionalCondition?: string;
  roomCount?: number;
  bathroomCount?: number;
  phoneNumber?: string;
  isNear?: string;
  airconYn?: string;
  washerYn?: string;
  fridgeYn?: string;
  useaprYear?: number;
}

// export type FinderRequestPayload = {
//   preferredRegion: string;
//   priceType: PriceType;
//   maxDeposit: number;
//   maxRent: number;
//   houseType: HouseType;
//   additionalCondition?: string;
// };


export type FinderRequestCreatePayload = {
  preferredRegion: string;
  priceType: PriceType;
  maxDeposit: number;
  maxRent: number;
  houseType: HouseType;
  additionalCondition?: string;
  phoneNumber?: string;
  isNear?: string; // 학교 근처 여부 (y/n)
  airconYn?: string; // 에어컨 여부 (y/n)
  washerYn?: string; // 세탁기 여부 (y/n)
  fridgeYn?: string; // 냉장고 여부 (y/n)
  useaprYear?: number; // 노후도 (1: 5년 이하, 2: 5~9년, 3: 10~19년, 4: 20~29년, 5: 30년 이상)
};

export type FinderRequestUpdatePayload =
  Partial<FinderRequestCreatePayload> & {
    finder_request_id: number;
    status?: FinderRequestStatus;
  };
