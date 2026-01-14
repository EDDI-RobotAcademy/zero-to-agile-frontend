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


/* =========================
 * 추천 / 요약 관련
 * ========================= */

export type TaskStatus =
  | "IDLE"
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "TIMEOUT"
  | "ERROR";

export type RawHouse = {
  house_platform_id: number;
  title: string;
  address: string;
  deposit: number | null;
  monthly_rent: number;
  manage_cost: number | null;
  snapshot_id: string;
  sales_type: string;
  room_type: string;
  residence_type: string;
  contract_area: number | null;
  exclusive_area: number;
  floor_no: number | null;
  all_floors: number;
  lat_lng: { lat: number; lng: number };
  image_urls: string; // JSON string, not array
  gu_nm: string;
  dong_nm: string;
  abang_user_id: number | null;
  created_at: string;
  updated_at: string;
  registered_at: string | null;
  domain_id: string | null;
  rgst_no: string | null;
  pnu_cd: string | null;
  is_banned: boolean;
  can_park: boolean;
  has_elevator: boolean;
};

export type ObservationSummary = {
  snapshot_id: string | null;
  observation_version: string;
  source_data_version: string;
  calculated_at: string;
  price: {
    monthly_cost_est: number;
    price_percentile: number;
    price_zscore: number;
    price_burden_nonlinear: number;
    estimated_move_in_cost: number;
  };
  commute: {
    distance_to_school_min: number;
    distance_bucket: string;
    distance_percentile: number;
    distance_nonlinear_score: number;
    distance_details_top3: any[];
  };
  risk: {
    risk_event_count: number;
    risk_event_types: string[];
    risk_probability_est: number;
    risk_severity_score: number;
    risk_nonlinear_penalty: number;
  };
  options: {
    essential_option_coverage: number;
    convenience_score: number;
  };
};

export type ScoreBreakdown = {
  weights: {
    price: number;
    risk: number;
    option: number;
    distance: number;
  };
  price_score: number;
  option_score: number;
  risk_score: number;
  distance_score: number;
  total_score: number;
};

export type AIExplanation = {
  recommended_reasons?: Array<{
    code: string;
    text: string;
    evidence?: Record<string, unknown>;
  }>;
  reject_reasons?: RejectReason[];
  warnings: string[];
};

export type RejectReason = {
  code: string;
  text: string;
  evidence?: Record<string, unknown>;
};

export type RecommendationItem = {
  rank: number;
  decision_status: "RECOMMENDED";
  house_platform_id: number;
  raw: RawHouse;
  observation_summary: ObservationSummary;
  score_breakdown: ScoreBreakdown;
  ai_explanation: AIExplanation;
};

export type RejectedItem = {
  rank: number;
  decision_status: "REJECTED";
  house_platform_id: number;
  raw: RawHouse;
  observation_summary: ObservationSummary;
  score_breakdown: ScoreBreakdown | null;
  reject_reasons: RejectReason[];
  ai_explanation: AIExplanation;
};

export type RecommendationReport = {
  finder_request_id: number;
  generated_at: string;
  status: string;
  detail: string | null;
  query_context: {
    segment_id: string;
    policy_version: string;
    region_scope: string | null;
    rep_school_set: {
      rep_school_set_id?: number;
      name?: string;
      route_mode?: string;
      route_version?: string;
    } | null;
    cohort_rule: {
      cohort_key?: string;
      fallback_levels?: string[];
      window_days?: number;
    } | null;
    user_constraints: {
      budget_deposit_max: number;
      budget_monthly_max: number;
      price_type: string;
      preferred_region: string;
      house_type: string | null;
      additional_condition: string | null;
      is_near: boolean;
      aircon_yn: string;
      washer_yn: string;
      fridge_yn: string;
      max_building_age: number;
    };
  };
  summary: {
    total_candidates: number;
    recommended_count: number;
    rejected_count: number;
    top_k: number;
    rejection_top_k: number;
  };
  recommended_top_k: RecommendationItem[];
  rejected_top_k: RejectedItem[];
};
