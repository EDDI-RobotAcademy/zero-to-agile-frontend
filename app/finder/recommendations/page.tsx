"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/common/Button";
import {
  startRecommendation,
  getRecommendationStatus,
} from "@/lib/repositories/finderRepository";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  Sparkles,
  XCircle,
} from "lucide-react";
import type {
  TaskStatus,
  RecommendationReport,
  RecommendationItem,
  RejectedItem,
} from "@/types/finder";

function formatNumber(value?: number) {
  if (value === undefined || value === null) return "-";
  return Number(value).toLocaleString();
}

function formatScore(value?: number) {
  if (value === undefined || value === null) return "-";
  return `${Math.round(value)}점`;
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
}

export default function FinderRecommendationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [report, setReport] = useState<RecommendationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("IDLE");
  const [activeTab, setActiveTab] = useState<"recommended" | "rejected">(
    "recommended"
  );
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const hasStartedRef = useRef(false);
  const isMountedRef = useRef(true);

  // 요약 통계 렌더링
  const renderSummaryStats = () => {
    if (!report) return null;

    const summary = report.summary;
    const query = report.query_context;

    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">총 후보</p>
            <p className="text-lg font-bold text-slate-900">
              {formatNumber(summary?.total_candidates)}
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-xs text-slate-500">추천</p>
            <p className="text-lg font-bold text-blue-700">
              {formatNumber(summary?.recommended_count)}
            </p>
          </div>
          <div className="rounded-2xl bg-red-50 p-4">
            <p className="text-xs text-slate-500">제외</p>
            <p className="text-lg font-bold text-red-600">
              {formatNumber(summary?.rejected_count)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-xs text-slate-500 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="font-semibold text-slate-600">선호 지역</p>
            <p>{query?.user_constraints?.preferred_region ?? "-"}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="font-semibold text-slate-600">최대 건물 연식</p>
            <p>{query?.user_constraints?.max_building_age ?? "-"}년</p>
          </div>
        </div>
      </div>
    );
  };

  // 매물 카드 클릭 핸들러
  const handleCardClick = (item: RecommendationItem | RejectedItem) => {
    // sessionStorage에 추천 정보 저장
    const finderRequestId = searchParams.get("requestId");
    const recommendationData = {
      observation: item.observation_summary,
      score: "score_breakdown" in item ? item.score_breakdown : undefined,
      reasons: "ai_explanation" in item ? item.ai_explanation?.recommended_reasons : [],
      rejects: "reject_reasons" in item ? item.reject_reasons : [],
      rank: item.rank,
      decision_status: item.decision_status,
      finderRequestId: finderRequestId ? Number(finderRequestId) : undefined,
    };

    sessionStorage.setItem(
      `recommendation-${item.house_platform_id}`,
      JSON.stringify(recommendationData)
    );

    // 상세 페이지로 이동
    router.push(`/finder/recommendations/${item.house_platform_id}`);
  };

  // 매물 카드 렌더링
  const renderRecommendationCard = (
    item: RecommendationItem | RejectedItem,
    key: string
  ) => {
    const expanded = !!expandedIds[key];
    const raw = item.raw || {};
    const observation = item.observation_summary;
    const score = "score_breakdown" in item ? item.score_breakdown : undefined;
    const reasons = "ai_explanation" in item ? item.ai_explanation?.recommended_reasons : [];
    const rejects = "reject_reasons" in item ? item.reject_reasons : [];

    return (
      <div
        key={key}
        className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 cursor-pointer transition hover:shadow-lg"
        onClick={() => handleCardClick(item)}
      >
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                순위 #{item.rank}
              </p>
              <h3 className="text-lg font-bold text-slate-900">
                {raw.title ?? "매물 정보"}
              </h3>
              <p className="text-sm text-slate-500">{raw.address ?? "-"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
                {raw.sales_type ?? "-"}
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
                {raw.room_type ?? "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">보증금</p>
              <p className="text-lg font-bold text-slate-900">
                {formatNumber(raw.deposit)}만원
              </p>
              <p className="text-xs text-slate-500">
                월세 {formatNumber(raw.monthly_rent)}만원 · 관리비{" "}
                {formatNumber(raw.manage_cost)}만원
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">면적 / 층수</p>
              <p className="text-lg font-bold text-slate-900">
                {raw.exclusive_area ?? "-"}㎡ · {raw.floor_no ?? "-"}층
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">총점</p>
              <p className="text-lg font-bold text-slate-900">
                {formatScore(score?.total_score)}
              </p>
            </div>
          </div>

          {activeTab === "recommended" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-emerald-600 p-1">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="text-xs font-bold text-emerald-700">AI 추천 이유</p>
              </div>
              <ul className="space-y-2">
                {(reasons ?? []).length > 0 ? (
                  reasons?.map((reason, idx) => (
                    <li key={reason.code} className="flex items-start gap-2">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <p className="flex-1 text-sm leading-relaxed text-emerald-900">{reason.text}</p>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-emerald-700">추천 이유를 불러오지 못했습니다.</li>
                )}
              </ul>
            </div>
          )}

          {activeTab === "rejected" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-red-600 p-1">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
                <p className="text-xs font-bold text-red-700">제외 이유</p>
              </div>
              <ul className="space-y-2">
                {(rejects ?? []).length > 0 ? (
                  rejects?.map((reason, idx) => (
                    <li key={reason.code} className="flex items-start gap-2">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <p className="flex-1 text-sm leading-relaxed text-red-900">{reason.text}</p>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-red-700">제외 이유를 불러오지 못했습니다.</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl px-4 py-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedIds((prev) => ({
                  ...prev,
                  [key]: !prev[key],
                }));
              }}
            >
              {expanded ? "상세 근거 닫기" : "상세 근거 보기"}
            </Button>
          </div>

          {expanded && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-700 mb-2">관측 요약</p>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>통학 시간</span>
                    <span className="font-semibold text-slate-900">
                      {formatNumber(observation?.commute?.distance_to_school_min)} 분
                      {observation?.commute?.distance_bucket && (
                        <span className="ml-1 text-blue-600">({observation.commute.distance_bucket})</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>월비용 추정</span>
                    <span className="font-semibold text-slate-900">
                      {formatNumber(observation?.price?.monthly_cost_est)}만원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>가격 분위</span>
                    <span className="font-semibold text-slate-900">
                      {observation?.price?.price_percentile !== undefined
                        ? `${Math.round(observation.price.price_percentile * 100)}%`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>리스크 확률</span>
                    <span className="font-semibold text-slate-900">
                      {observation?.risk?.risk_probability_est !== undefined
                        ? `${(observation.risk.risk_probability_est * 100).toFixed(1)}%`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>옵션 커버리지</span>
                    <span className="font-semibold text-slate-900">
                      {observation?.options?.essential_option_coverage !== undefined
                        ? `${Math.round(observation.options.essential_option_coverage * 100)}%`
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {activeTab === "recommended" && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-700 mb-2">점수 요약</p>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>가격 점수</span>
                      <span className="font-semibold text-slate-900">{score?.price_score ?? "-"}점</span>
                    </div>
                    <div className="flex justify-between">
                      <span>거리 점수</span>
                      <span className="font-semibold text-slate-900">{score?.distance_score ?? "-"}점</span>
                    </div>
                    <div className="flex justify-between">
                      <span>리스크 점수</span>
                      <span className="font-semibold text-slate-900">{score?.risk_score ?? "-"}점</span>
                    </div>
                    <div className="flex justify-between">
                      <span>옵션 점수</span>
                      <span className="font-semibold text-slate-900">{score?.option_score ?? "-"}점</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const requestId = searchParams.get("requestId");
    isMountedRef.current = true;

    if (!requestId || hasStartedRef.current) return;
    hasStartedRef.current = true;

    async function fetchRecommendation() {
      try {
        setLoading(true);
        setTaskStatus("QUEUED");

        // 추천 시작
        const { search_house_id } = await startRecommendation(Number(requestId));

        setTaskStatus("PROCESSING");
        const startTime = Date.now();

        // 폴링으로 상태 확인
        while (isMountedRef.current) {
          const { status, result } = await getRecommendationStatus(search_house_id);

          setTaskStatus(status as TaskStatus);

          if (status === "COMPLETED" && result) {
            setReport(result);
            setLoading(false);
            break;
          }

          if (Date.now() - startTime > 30000) {
            setTaskStatus("TIMEOUT");
            setError("추천 요청 시간이 초과되었습니다. 다시 시도해주세요.");
            setLoading(false);
            break;
          }

          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          setTaskStatus("ERROR");
          setError(err?.message ?? "추천 리포트를 불러오지 못했습니다.");
          setLoading(false);
        }
      }
    }

    fetchRecommendation();

    return () => {
      isMountedRef.current = false;
    };
  }, [searchParams]);

  const summary = report?.summary;
  const query = report?.query_context;
  const recommended = report?.recommended_top_k ?? [];
  const rejected = report?.rejected_top_k ?? [];
  const list = activeTab === "recommended" ? recommended : rejected;

  const statusMessages: Record<
    TaskStatus,
    { title: string; description: string; icon: React.ReactNode }
  > = {
    IDLE: {
      title: "추천 준비 중...",
      description: "잠시만 기다려주세요.",
      icon: <Clock className="h-6 w-6 text-blue-600" />,
    },
    QUEUED: {
      title: "추천 요청이 접수되었습니다",
      description: "곧 AI가 매물 분석을 시작합니다.",
      icon: <Info className="h-6 w-6 text-blue-600" />,
    },
    PROCESSING: {
      title: "AI가 매물을 분석하고 있어요",
      description: "RAG 검색 + 리스크 분석 + LLM 생성 중...",
      icon: <Sparkles className="h-6 w-6 text-blue-600" />,
    },
    COMPLETED: {
      title: "추천 완료!",
      description: "결과를 불러오는 중입니다.",
      icon: <CheckCircle2 className="h-6 w-6 text-blue-600" />,
    },
    TIMEOUT: {
      title: "시간 초과",
      description: "다시 시도해주세요.",
      icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    },
    ERROR: {
      title: "오류 발생",
      description: "다시 시도해주세요.",
      icon: <XCircle className="h-6 w-6 text-red-500" />,
    },
  };

  if (loading) {
    const currentMessage = statusMessages[taskStatus] || statusMessages.IDLE;
    return (
      <main className="space-y-6">
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
            {currentMessage.icon}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900">
              {currentMessage.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {currentMessage.description}
            </p>
            <p className="mt-4 text-xs text-slate-400">
              현재 상태:{" "}
              <span className="font-semibold text-blue-600">
                {taskStatus}
              </span>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-sky-50 p-8 shadow-sm ring-1 ring-blue-100">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[12px] font-medium tracking-tight text-blue-500 ml-0.5">
              의사결정 리포트
            </p>
            <h2 className="text-[26px] font-semibold tracking-[-0.015em] mb-1 text-slate-900">
              추천 매물 리포트
            </h2>
            <p className="text-sm tracking-[-0.005em] leading-relaxed text-slate-500">
              추천 / 제외 이유와 근거를 함께 확인하세요.
            </p>
          </div>
          {report?.generated_at && (
            <div className="rounded-2xl bg-white px-4 py-3 text-xs text-slate-500 shadow-sm ring-1 ring-slate-200">
              <div>생성일: {formatDate(report.generated_at)}</div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {renderSummaryStats()}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("recommended")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "recommended"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          추천 TOP {summary?.top_k ?? recommended.length}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("rejected")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "rejected"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          제외 TOP {summary?.rejection_top_k ?? rejected.length}
        </button>
      </div>

      {list.length === 0 && (
        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl bg-slate-50 p-12">
          <div className="text-center">
            <p className="text-5xl">🧾</p>
            <p className="mt-4 text-lg font-semibold text-slate-700">
              표시할 항목이 없습니다
            </p>
            <p className="mt-2 text-sm text-slate-500">
              조건을 변경하거나 나중에 다시 확인해주세요
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {list.map((item) => {
          const key = `${activeTab}-${item.house_platform_id}`;
          return renderRecommendationCard(item, key);
        })}
      </div>
    </main>
  );
}
