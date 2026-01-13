import type { RecommendationReport } from "@/types/finder";

export const finderRecommendationsReportMock: RecommendationReport = {
  request_id: "req_20260109_000001",
  generated_at: "2026-01-09T00:32:00+09:00",
  query_context: {
    segment_id: "STUDENT_DEFAULT",
    policy_version: "policy_v1",
    region_scope: "MAPO-SEODAEMUN-EUNPYEONG",
    rep_school_set: {
      rep_school_set_id: 1,
      name: "MAPO-SEODAEMUN-EUNPYEONG_V1",
      route_mode: "TRANSIT",
      route_version: "osrm_2026-01-02",
    },
    cohort_rule: {
      cohort_key: "(region_unit × room_type × sales_type)",
      fallback_levels: ["L0(dong)", "L1(gu)", "L2(seoul)"],
      window_days: 90,
    },
    user_constraints: {
      budget_deposit_max: 1000,
      budget_monthly_max: 80,
      max_commute_min: 35,
      max_old_residance: 10,
      must_have_options: ["AIRCON", "WASHER"],
    },
  },
  summary: {
    total_candidates: 1234,
    recommended_count: 50,
    rejected_count: 1184,
    top_k: 10,
    rejection_top_k: 10,
  },
  recommended_top_k: [
    {
      rank: 1,
      decision_status: "RECOMMENDED",
      house_platform_id: 47208379,
      raw: {
        title: "신촌 인근 풀옵션 원룸",
        sales_type: "월세",
        deposit: 500,
        monthly_rent: 55,
        manage_cost: 5,
        room_type: "원룸",
        exclusive_area_m2: 17.2,
        floor: 3,
        address: "서울 서대문구 ...",
        images: ["https://picsum.photos/seed/rec-1/600/400"],
      },
      observation_summary: {
        cohort_id: 10231,
        cohort_level: "L0",
        dist_snapshot_id: 90012,
        window: { start: "2025-10-11", end: "2026-01-09" },
        price: {
          monthly_cost_est: 60,
          price_percentile: 0.22,
          price_z: -0.84,
        },
        commute: {
          distance_to_school_min: 18.2,
          distance_bucket: "0_20",
          distance_percentile: 0.18,
        },
        risk: {
          risk_event_count: 0,
          risk_probability_est: 0.03,
          risk_severity_score: 0.0,
        },
        options: {
          essential_option_coverage: 1.0,
        },
      },
      score_breakdown: {
        weights: {
          affordability: 0.35,
          commute: 0.35,
          safety: 0.2,
          options: 0.1,
        },
        affordability_score: 0.78,
        commute_score: 0.86,
        safety_score: 0.94,
        option_score: 1.0,
        total_score: 0.86,
      },
      ai_explanation: {
        reasons_top3: [
          {
            code: "AFFORDABLE_IN_COHORT",
            text: "같은 지역·유형·거래 분포에서 월비용이 하위 22% 수준입니다.",
            evidence: {
              price_percentile: 0.22,
              monthly_cost_est: 60,
              cohort_level: "L0",
            },
          },
          {
            code: "GOOD_COMMUTE_TO_REP_SCHOOLS",
            text: "대표 학교 기준 최소 통학 18분(0~20분 구간)으로 이동성이 좋습니다.",
            evidence: {
              distance_to_school_min: 18.2,
              distance_bucket: "0_20",
            },
          },
          {
            code: "LOW_RISK_SIGNAL",
            text: "리스크 이벤트가 관측되지 않았고, 추정 확률도 낮습니다.",
            evidence: { risk_event_count: 0, risk_probability_est: 0.03 },
          },
        ],
        warnings: [],
      },
    },
    {
      rank: 2,
      decision_status: "RECOMMENDED",
      house_platform_id: 47208380,
      raw: {
        title: "이대 인근 채광 좋은 투룸",
        sales_type: "월세",
        deposit: 800,
        monthly_rent: 60,
        manage_cost: 6,
        room_type: "투룸",
        exclusive_area_m2: 23.5,
        floor: 4,
        address: "서울 서대문구 ...",
        images: ["https://picsum.photos/seed/rec-2/600/400"],
      },
      observation_summary: {
        price: { monthly_cost_est: 68, price_percentile: 0.32 },
        commute: { distance_to_school_min: 21.5, distance_bucket: "20_30" },
        risk: { risk_probability_est: 0.04 },
        options: { essential_option_coverage: 0.9 },
      },
      score_breakdown: {
        affordability_score: 0.72,
        commute_score: 0.8,
        safety_score: 0.88,
        option_score: 0.9,
        total_score: 0.8,
      },
      ai_explanation: {
        reasons_top3: [
          {
            code: "COMMUTE_OK",
            text: "대표 학교까지 통학 20~30분 구간으로 접근성이 안정적입니다.",
          },
          {
            code: "COST_BALANCED",
            text: "월비용이 평균 대비 무난한 수준입니다.",
          },
        ],
        warnings: [],
      },
    },
  ],
  rejected_top_k: [
    {
      rank: 1,
      decision_status: "REJECTED",
      house_platform_id: 48001234,
      raw: {
        title: "홍대 초역세권 원룸",
        sales_type: "월세",
        deposit: 2000,
        monthly_rent: 95,
        manage_cost: 10,
        room_type: "원룸",
        exclusive_area_m2: 18.1,
        floor: 7,
        address: "서울 마포구 ...",
        images: ["https://picsum.photos/seed/reject-1/600/400"],
      },
      observation_summary: {
        price: { monthly_cost_est: 105, price_percentile: 0.91 },
        commute: { distance_to_school_min: 28.0, distance_bucket: "20_30" },
        risk: { risk_probability_est: 0.05 },
        options: { essential_option_coverage: 1.0 },
      },
      reject_reasons: [
        {
          code: "BUDGET_OVER_MONTHLY",
          text: "월 예산 상한을 초과했습니다.",
          evidence: { monthly_cost_est: 105, budget_monthly_max: 80 },
        },
        {
          code: "DEPOSIT_OVER",
          text: "보증금 상한을 초과했습니다.",
          evidence: { deposit: 2000, budget_deposit_max: 1000 },
        },
      ],
      explanation: {
        reasons_top3: [],
        warnings: ["예산 조건 위반으로 후보에서 제외되었습니다."],
      },
    },
    {
      rank: 2,
      decision_status: "REJECTED",
      house_platform_id: 48001235,
      raw: {
        title: "공덕역 인근 원룸",
        sales_type: "월세",
        deposit: 1200,
        monthly_rent: 85,
        manage_cost: 8,
        room_type: "원룸",
        exclusive_area_m2: 16.4,
        floor: 2,
        address: "서울 마포구 ...",
        images: ["https://picsum.photos/seed/reject-2/600/400"],
      },
      observation_summary: {
        price: { monthly_cost_est: 92, price_percentile: 0.76 },
        commute: { distance_to_school_min: 32.0, distance_bucket: "30_40" },
        risk: { risk_probability_est: 0.06 },
        options: { essential_option_coverage: 0.8 },
      },
      reject_reasons: [
        {
          code: "BUDGET_OVER_MONTHLY",
          text: "월 예산 상한을 초과했습니다.",
          evidence: { monthly_cost_est: 92, budget_monthly_max: 80 },
        },
      ],
      explanation: {
        reasons_top3: [],
        warnings: ["예산 조건 위반으로 후보에서 제외되었습니다."],
      },
    },
  ],
};
