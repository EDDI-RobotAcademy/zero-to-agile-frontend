/* =========================
 * 공통 타입 (값은 한글)
 * ========================= */

export type SalesType = '월세' | '전세' | '매매';

export type ResidenceType =
  | '원룸'
  | '투룸'
  | '쓰리룸'
  | '오피스텔'
  | '아파트'
  | '빌라';

export type RoomType = '오픈형' | '분리형' | '복층';


/* =========================
 * 셀렉트 옵션 상수
 * ========================= */

export const SALES_TYPES = [
  { value: '월세', label: '월세' },
  { value: '전세', label: '전세' },
  { value: '매매', label: '매매' },
] as const satisfies readonly {
  value: SalesType;
  label: string;
}[];

export const RESIDENCE_TYPES = [
  { value: '원룸', label: '원룸' },
  { value: '투룸', label: '투룸' },
  { value: '쓰리룸', label: '쓰리룸' },
  { value: '오피스텔', label: '오피스텔' },
  { value: '아파트', label: '아파트' },
  { value: '빌라', label: '빌라' },
] as const satisfies readonly {
  value: ResidenceType;
  label: string;
}[];

export const ROOM_TYPES = [
  { value: '오픈형', label: '오픈형' },
  { value: '분리형', label: '분리형' },
  { value: '복층', label: '복층' },
] as const satisfies readonly {
  value: RoomType;
  label: string;
}[];


/* =========================
 * 기본 프로필
 * ========================= */

export interface OwnerProfile {
  id: string;
  nickname: string;
  phone?: string;
}


/* =========================
 * 매물 메인 타입
 * ========================= */

export interface HousePlatform {
  housePlatformId: number;
  title: string;
  address: string;
  deposit: number;
  domainId: number;
  rgstNo: string;
  salesType: SalesType;
  monthlyRent: number;
  roomType: RoomType;
  contractArea: number;
  exclusiveArea: number;
  floorNo: number;
  allFloors: number;
  latLng: any;
  manageCost: number;
  canPark: boolean;
  hasElevator: boolean;
  imageUrls: string;
  pnuCd: string;
  isBanned: boolean;
  residenceType: ResidenceType;
  guNm: string;
  dongNm: string;
  registeredAt: string;
  crawledAt: string;
  snapshotId: string;
  abangUserId: number;
  phoneNumber?: string; // 컨텍 수락 시에만 제공
  createdAt: string;
  updatedAt: string;
}


/* =========================
 * 생성 / 수정 Payload
 * ========================= */

export interface HousePlatformCreatePayload {
  title: string;
  address: string;
  deposit: number;
  domainId: number;
  rgstNo: string;
  salesType: SalesType;
  monthlyRent: number;
  roomType: RoomType;
  contractArea: number;
  exclusiveArea: number;
  floorNo: number;
  allFloors: number;
  latLng: any;
  manageCost: number;
  canPark: boolean;
  hasElevator: boolean;
  imageUrls: string;
  pnuCd: string;
  isBanned: boolean;
  residenceType: ResidenceType;
  guNm: string;
  dongNm: string;
  snapshotId: string;
}

export interface HousePlatformUpdatePayload {
  title?: string;
  address?: string;
  deposit?: number;
  rgstNo?: string;
  salesType?: SalesType;
  monthlyRent?: number;
  roomType?: RoomType;
  contractArea?: number;
  exclusiveArea?: number;
  floorNo?: number;
  allFloors?: number;
  latLng?: any;
  manageCost?: number;
  canPark?: boolean;
  hasElevator?: boolean;
  imageUrls?: string;
  pnuCd?: string;
  isBanned?: boolean;
  residenceType?: ResidenceType;
  guNm?: string;
  dongNm?: string;
  snapshotId?: string;
}


/* =========================
 * 폼 상태 타입
 * ========================= */

export interface HousePlatformFormState {
  title: string;
  domainId: number;
  rgstNo: string;
  salesType: SalesType;
  deposit: number;
  monthlyRent: number;
  residenceType: ResidenceType;
  roomType: RoomType;
  contractArea: number;
  exclusiveArea: number;
  floorNo: number;
  allFloors: number;
  manageCost: number;
  canPark: boolean;
  hasElevator: boolean;
  pnuCd: string;
  snapshotId: string;
}

export interface HousePlatformEditFormState {
  title: string;
  salesType: SalesType;
  deposit: number;
  monthlyRent: number;
  residenceType: ResidenceType;
  roomType: RoomType;
  contractArea: number;
  exclusiveArea: number;
  floorNo: number;
  allFloors: number;
  manageCost: number;
  canPark: boolean;
  hasElevator: boolean;
}


/* =========================
 * 추천 / 요약 관련
 * ========================= */

export interface HousePlatformSummary {
  housePlatformId: number;
  title: string;
  address: string;
  salesType: SalesType;
  residenceType: ResidenceType;
  monthlyRent: number;
  deposit: number;
  roomType: RoomType;
  guNm: string;
  dongNm: string;
}

export interface MatchedFinderRequest {
  finderRequestId: number;
  abangUserId: number;
  priceType: string;
  houseType: string;
  maxRent: number;
  preferredRegion: string;
}

export interface RecommendationResult {
  housePlatform: HousePlatformSummary;
  matchedFinderRequests: MatchedFinderRequest[];
}

export interface OwnerRecommendation {
  abangUserId: number;
  rentMargin: number;
  totalRecommendedHouses: number;
  totalMatchedRequests: number;
  results: RecommendationResult[];
}
