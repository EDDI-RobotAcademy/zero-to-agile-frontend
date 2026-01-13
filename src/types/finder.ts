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
  title?: string;
  sales_type?: string;
  deposit?: number;
  monthly_rent?: number;
  manage_cost?: number;
  room_type?: string;
  exclusive_area_m2?: number;
  floor?: number;
  address?: string;
  images?: string[];
};

export type ObservationSummary = {
  cohort_id?: number;
  cohort_level?: string;
  dist_snapshot_id?: number;
  window?: { start?: string; end?: string };
  price?: {
    monthly_cost_est?: number;
    price_percentile?: number;
    price_z?: number;
  };
  commute?: {
    distance_to_school_min?: number;
    distance_bucket?: string;
    distance_percentile?: number;
  };
  risk?: {
    risk_event_count?: number;
    risk_probability_est?: number;
    risk_severity_score?: number;
  };
  options?: {
    essential_option_coverage?: number;
  };
};

export type ScoreBreakdown = {
  weights?: {
    affordability?: number;
    commute?: number;
    safety?: number;
    options?: number;
  };
  affordability_score?: number;
  commute_score?: number;
  safety_score?: number;
  option_score?: number;
  total_score?: number;
};

export type AIExplanation = {
  reasons_top3?: Array<{
    code: string;
    text: string;
    evidence?: Record<string, unknown>;
  }>;
  warnings?: string[];
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
  observation_summary?: ObservationSummary;
  score_breakdown?: ScoreBreakdown;
  ai_explanation?: AIExplanation;
};

export type RejectedItem = {
  rank: number;
  decision_status: "REJECTED";
  house_platform_id: number;
  raw: RawHouse;
  observation_summary?: ObservationSummary;
  reject_reasons?: RejectReason[];
  explanation?: { reasons_top3?: never[]; warnings?: string[] };
};

export type RecommendationReport = {
  request_id: string;
  generated_at: string;
  query_context?: {
    segment_id?: string;
    policy_version?: string;
    region_scope?: string;
    rep_school_set?: {
      rep_school_set_id?: number;
      name?: string;
      route_mode?: string;
      route_version?: string;
    };
    cohort_rule?: {
      cohort_key?: string;
      fallback_levels?: string[];
      window_days?: number;
    };
    user_constraints?: {
      budget_deposit_max?: number;
      budget_monthly_max?: number;
      max_commute_min?: number;
      max_old_residance?: number;
      must_have_options?: string[];
    };
  };
  summary?: {
    total_candidates?: number;
    recommended_count?: number;
    rejected_count?: number;
    top_k?: number;
    rejection_top_k?: number;
  };
  recommended_top_k?: RecommendationItem[];
  rejected_top_k?: RejectedItem[];
};
