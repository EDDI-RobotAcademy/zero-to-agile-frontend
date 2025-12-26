import { Listing } from './listing';

export type RiskLevel = 'low' | 'medium' | 'high';

export type RiskSeverity = 'low' | 'medium' | 'high';

export interface RiskFlag {
  code: string;
  severity: RiskSeverity;
  message: string;
}

export interface MatchScore {
  score: number;
  score_type: string;
  vector_distance: number;
}

export interface HouseDetail {
  house_platform_id: number;
  domain_id: number;
  rgst_no: string;
  title: string;
  sales_type: string; // "월세", "전세", "매매"
  deposit: number;
  monthly_rent?: number;
  manage_cost?: number;
  room_type: string; // "투룸", "쓰리룸", "오픈형원룸" 등
  residence_type?: string; // "단독주택", "공동주택", "도시형생활주택", "오피스텔" 등
  contract_area?: number;
  exclusive_area?: number;
  floor?: number;
  all_floors?: number;
  address: string;
  lat_lng?: { lat: number; lng: number };
  can_park?: boolean;
  has_elevator?: boolean;
  image_urls?: string[];
  created_at?: string;
  updated_at?: string;
  // 새로운 필드들
  built_in?: string[]; // 기본 제공 가전 (에어컨, 냉장고, 세탁기 등)
  near_mart?: boolean; // 마트 근처 여부
  near_univ?: boolean; // 대학 근처 여부
  near_transport?: boolean; // 교통 근처 여부
  management_excluded?: string[]; // 관리비에 포함되지 않는 항목
  management_included?: string[]; // 관리비에 포함되는 항목
}

export interface RecommendationResult {
  rank: number;
  match: MatchScore;
  house: HouseDetail;
  why_recommended: string[];
  risk_flags: RiskFlag[];
}

export interface RecommendedListing extends Listing {
  dong?: string; // e.g., "신정동"
  monthlyRent?: number; // 월세
  salesType?: string; // "전세", "월세", "매매"
  manageCost?: number; // 관리비
  allFloors?: number; // 총 층수
  canPark?: boolean; // 주차 가능 여부
  hasElevator?: boolean; // 엘리베이터 여부
  aiReason?: string; // AI 추천 이유
  aiReasons?: string[]; // AI 추천 이유 목록
  riskLevel?: RiskLevel; // 리스크 레벨
  riskDescription?: string; // 리스크 설명
  riskFlags?: RiskFlag[]; // 리스크 플래그 목록
  rank?: number; // 추천 순위
  matchScore?: number; // 매칭 점수
}
