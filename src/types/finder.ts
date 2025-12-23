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
}

export type FinderRequestPayload = Omit<FinderRequestDetail, "finderRequestId" | "status">;
