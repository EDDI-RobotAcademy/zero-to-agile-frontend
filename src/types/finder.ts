import { PriceType, FinderRequestStatus, HouseType } from "@/types/houseOptions";
/**
 * FinderRequest - 임차인 요구서
 */
export interface FinderRequest {
  finderRequestId: number;
  abangUserId: number;
  preferredRegion: string;
  priceType: PriceType;
  maxDeposit: number;
  maxRent: number;
  status: FinderRequestStatus;
  houseType: string;
  additionalCondition: string;
  universityName: string;
  roomcount: string;
  bathroomcount: string;
  isNear: boolean;
  airconYn: string;
  washerYn: string;
  fridgeYn: string;
  maxBuildingAge: number;
  phoneNumber?: string; // 컨텍 수락 시에만 제공
  createdAt: string;
  updatedAt: string;
}

/**
 * 요구서 생성 Payload
 */
export interface FinderRequestCreatePayload {
  preferredRegion: string;
  priceType: PriceType;
  maxDeposit: number;
  maxRent: number;
  houseType: string;
  additionalCondition: string;
  universityName: string;
  roomcount: string;
  bathroomcount: string;
  isNear: boolean;
  airconYn: string;
  washerYn: string;
  fridgeYn: string;
  maxBuildingAge: number;
}

/**
 * 요구서 수정 Payload
 */
export interface FinderRequestUpdatePayload {
  preferredRegion?: string;
  priceType?: PriceType;
  maxDeposit?: number;
  maxRent?: number;
  houseType?: string;
  additionalCondition?: string;
  universityName?: string;
  roomcount?: string;
  bathroomcount?: string;
  isNear?: boolean;
  airconYn?: string;
  washerYn?: string;
  fridgeYn?: string;
  maxBuildingAge?: number;
  status?: FinderRequestStatus;
}
