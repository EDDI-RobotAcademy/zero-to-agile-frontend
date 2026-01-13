"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getHousePlatformById } from "@/lib/repositories/ownerRepository";
import { HousePlatform } from "@/types/owner";
import { ImageGallery } from "@/components/common/ImageGallery";
import { ChatbotWidget } from "@/components/chat/ChatbotWidget";
import { sendMessage } from "@/lib/repositories/contactRepository";
import {
  FileText,
  MapPin,
  Building2,
  Home,
  Wallet,
  DollarSign,
  CreditCard,
  Wrench,
  Ruler,
  Square,
  Building,
  Sparkles,
  Car,
  ArrowLeft,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

type RecommendationData = {
  observation?: {
    commute?: {
      distance_to_school_min?: number;
      distance_bucket?: string;
      distance_percentile?: number;
    };
    price?: {
      monthly_cost_est?: number;
      price_percentile?: number;
      price_z?: number;
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
  score?: {
    affordability_score?: number;
    commute_score?: number;
    safety_score?: number;
    option_score?: number;
    total_score?: number;
  };
  reasons?: Array<{
    code: string;
    text: string;
    evidence?: Record<string, unknown>;
  }>;
  rejects?: Array<{
    code: string;
    text: string;
    evidence?: Record<string, unknown>;
  }>;
  rank?: number;
  decision_status?: string;
  finderRequestId?: number;
};

function formatNumber(value?: number) {
  if (value === undefined || value === null) return "-";
  return Number(value).toLocaleString();
}

function formatScore(value?: number) {
  if (value === undefined || value === null) return "-";
  return `${Math.round(value * 100)}%`;
}

async function handleContactSubmit(
  housePlatformId: number,
  finderRequestId: number | undefined,
  message: string,
  onSuccess: () => void,
  onError: (msg: string) => void,
  setSending: (v: boolean) => void
) {
  if (!message.trim()) {
    alert("메시지를 입력해주세요.");
    return;
  }

  if (!finderRequestId) {
    alert("요구서 정보를 찾을 수 없습니다.");
    return;
  }

  try {
    setSending(true);
    await sendMessage({
      housePlatformId,
      finderRequestId,
      message: message.trim(),
    });
    alert("컨텍 요청을 전송했습니다!");
    onSuccess();
  } catch (err: any) {
    onError(err?.message ?? "컨텍 요청에 실패했습니다.");
  } finally {
    setSending(false);
  }
}

export default function RecommendationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [listing, setListing] = useState<HousePlatform | null>(null);
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [sendingContact, setSendingContact] = useState(false);

  const housePlatformId = Number(params.id);

  useEffect(() => {
    if (isNaN(housePlatformId)) {
      setError("잘못된 매물 ID입니다.");
      setLoading(false);
      return;
    }

    // sessionStorage에서 추천 정보 가져오기
    const storedData = sessionStorage.getItem(`recommendation-${housePlatformId}`);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setRecommendationData(parsed);
      } catch (e) {
        console.error("Failed to parse recommendation data:", e);
      }
    }

    // 매물 정보 가져오기
    (async () => {
      try {
        setLoading(true);
        const data = await getHousePlatformById(housePlatformId);
        setListing(data);
      } catch (err: any) {
        setError(err?.message ?? "매물을 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [housePlatformId]);

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">매물 정보를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="space-y-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="text-sm text-red-600">{error || "매물을 찾을 수 없습니다."}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            목록으로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  // 이미지 URL 파싱
  let imageUrlsArray: string[] = [];
  try {
    if (listing.imageUrls && listing.imageUrls.trim()) {
      const parsed = JSON.parse(listing.imageUrls);
      imageUrlsArray = Array.isArray(parsed) ? parsed.filter(url => url && url.trim()) : [];
    }
  } catch {
    if (listing.imageUrls && listing.imageUrls.trim()) {
      imageUrlsArray = [listing.imageUrls];
    }
  }

  const isRecommended = recommendationData?.decision_status === "RECOMMENDED";

  // 챗봇용 listing 데이터 변환
  const chatbotListing = listing ? {
    id: listing.housePlatformId,
    title: listing.title,
    description: `${listing.residenceType}, ${listing.roomType}`,
    type: listing.residenceType,
    images: imageUrlsArray,
    salesType: listing.salesType,
    price: listing.deposit,
    monthlyRent: listing.monthlyRent,
    manageCost: listing.manageCost,
    area: listing.exclusiveArea,
    floor: listing.floorNo,
    allFloors: listing.allFloors,
    hasElevator: listing.hasElevator,
    canPark: listing.canPark,
    rank: recommendationData?.rank || 0,
    matchScore: recommendationData?.score?.total_score || 0,
    options: [], // HousePlatform에 options 필드가 없어서 빈 배열
    aiReasons: recommendationData?.reasons?.map(r => r.text) || [],
    riskLevel: "low", // 임시값
    riskFlags: [],
    riskDescription: "",
  } : null;

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium tracking-tight text-blue-500 ml-0.5">
              {isRecommended ? "추천 매물" : "제외된 매물"}
            </p>
            <h2 className="mb-1.5 text-[26px] font-semibold tracking-[-0.015em] text-slate-900">
              {listing.title}
            </h2>
            <div className="flex gap-1.5">
              {recommendationData?.rank && (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[12px] font-medium text-blue-600">
                  순위 #{recommendationData.rank}
                </span>
              )}
              <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-[12px] font-medium text-slate-600">
                {listing.salesType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 추천 이유 (추천 매물인 경우) */}
      {isRecommended && recommendationData?.reasons && recommendationData.reasons.length > 0 && (
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-emerald-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-semibold tracking-tight text-emerald-900">
                AI 추천 이유
              </h3>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {recommendationData.reasons.map((reason, idx) => (
                <li key={reason.code} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {idx + 1}
                  </span>
                  <p className="flex-1 text-sm leading-relaxed text-slate-700">
                    {reason.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 제외 이유 (제외된 매물인 경우) */}
      {!isRecommended && recommendationData?.rejects && recommendationData.rejects.length > 0 && (
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-red-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              <h3 className="text-base font-semibold tracking-tight text-red-900">
                제외 이유
              </h3>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {recommendationData.rejects.map((reason, idx) => (
                <li key={reason.code} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                    {idx + 1}
                  </span>
                  <p className="flex-1 text-sm leading-relaxed text-slate-700">
                    {reason.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 점수 상세 (추천 매물인 경우) */}
      {isRecommended && recommendationData?.score && (
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <h3 className="text-base font-semibold tracking-tight text-slate-900">평가 점수</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">총점</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatScore(recommendationData.score.total_score)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">가격 점수</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatScore(recommendationData.score.affordability_score)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">통학 점수</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatScore(recommendationData.score.commute_score)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">안전 점수</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatScore(recommendationData.score.safety_score)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 관측 요약 */}
      {recommendationData?.observation && (
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <h3 className="text-base font-semibold tracking-tight text-slate-900">관측 요약</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendationData.observation.commute?.distance_to_school_min !== undefined && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">통학 시간</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {formatNumber(recommendationData.observation.commute.distance_to_school_min)} 분
                  </p>
                </div>
              )}
              {recommendationData.observation.price?.monthly_cost_est !== undefined && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">월비용 추정</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {formatNumber(recommendationData.observation.price.monthly_cost_est)}만원
                  </p>
                </div>
              )}
              {recommendationData.observation.price?.price_percentile !== undefined && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">가격 분위</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {recommendationData.observation.price.price_percentile.toFixed(2)}
                  </p>
                </div>
              )}
              {recommendationData.observation.risk?.risk_probability_est !== undefined && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">리스크 확률</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {recommendationData.observation.risk.risk_probability_est.toFixed(2)}
                  </p>
                </div>
              )}
              {recommendationData.observation.options?.essential_option_coverage !== undefined && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">옵션 커버리지</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {recommendationData.observation.options.essential_option_coverage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 이미지 갤러리 */}
      {imageUrlsArray.length > 0 && (
        <ImageGallery images={imageUrlsArray} alt={listing.title} />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* 기본 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <h3 className="text-base font-semibold tracking-tight text-slate-900">기본 정보</h3>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-start gap-2">
              <MapPin className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">주소</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{listing.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">매물 유형</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">
                  {listing.residenceType}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Home className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">방 구조</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">
                  {listing.roomType}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 금액 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-400" />
              <h3 className="text-base font-semibold tracking-tight text-slate-900">
                금액 정보
              </h3>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-start gap-2">
              <DollarSign className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">보증금</p>
                <p className="mt-0.5 text-[18px] font-semibold tracking-tight text-slate-900">
                  <span className="relative inline-block bg-gradient-to-t from-blue-200/70 to-blue-200/30 px-1 rounded-sm">
                    {listing.deposit.toLocaleString()}만원
                  </span>
                </p>
              </div>
            </div>

            {listing.monthlyRent > 0 && (
              <div className="flex items-start gap-2">
                <CreditCard className="mt-[2px] h-4 w-4 text-blue-400" />
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-slate-400">월세</p>
                  <p className="mt-0.5 text-[18px] font-semibold tracking-tight text-slate-900">
                    <span className="relative inline-block bg-gradient-to-t from-blue-200/70 to-blue-200/30 px-1 rounded-sm">
                      {listing.monthlyRent.toLocaleString()}만원
                    </span>
                  </p>
                </div>
              </div>
            )}

            {listing.manageCost > 0 && (
              <div className="flex items-start gap-2">
                <Wrench className="mt-[2px] h-4 w-4 text-blue-400" />
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-slate-400">관리비</p>
                  <p className="mt-0.5 text-[18px] font-semibold tracking-tight text-slate-900">
                    <span className="relative inline-block bg-gradient-to-t from-blue-200/70 to-blue-200/30 px-1 rounded-sm">
                      {listing.manageCost.toLocaleString()}만원
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-blue-400" />
              <h3 className="text-base font-semibold tracking-tight text-slate-900">면적 및 층수</h3>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-start gap-2">
              <Square className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">전용면적</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{listing.exclusiveArea}㎡</p>
              </div>
            </div>

            {listing.contractArea > 0 && (
              <div className="flex items-start gap-2">
                <Square className="mt-[2px] h-4 w-4 text-blue-400" />
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-slate-400">계약면적</p>
                  <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{listing.contractArea}㎡</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Building className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">층수</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">
                  {listing.floorNo}층 / 전체 {listing.allFloors}층
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 편의시설 */}
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <h3 className="text-base font-semibold tracking-tight text-slate-900">편의시설</h3>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Building2 className={`h-4 w-4 ${listing.hasElevator ? 'text-blue-400' : 'text-slate-300'}`} />
                <span className={`text-[14px] ${listing.hasElevator ? 'font-medium text-slate-700' : 'text-slate-400'}`}>
                  엘리베이터
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Car className={`h-4 w-4 ${listing.canPark ? 'text-blue-400' : 'text-slate-300'}`} />
                <span className={`text-[14px] ${listing.canPark ? 'font-medium text-slate-700' : 'text-slate-400'}`}>
                  주차 가능
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-between gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium tracking-tight text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          목록으로
        </button>
        <button
          onClick={() => setShowContactModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium tracking-tight text-white transition hover:bg-blue-700 active:scale-[0.98]"
        >
          <MessageSquare className="h-4 w-4" />
          컨텍하기
        </button>
      </div>

      {/* 컨텍하기 모달 */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 bg-gradient-to-br from-blue-100 via-white to-blue-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">임대인에게 컨텍하기</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="mb-4 text-sm text-slate-600">
                이 매물의 임대인에게 전달할 메시지를 작성해주세요.
              </p>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="예: 이 매물에 관심이 있습니다. 자세한 상담을 받고 싶습니다."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                rows={5}
                disabled={sendingContact}
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setContactMessage("");
                  }}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                  disabled={sendingContact}
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    handleContactSubmit(
                      housePlatformId,
                      recommendationData?.finderRequestId,
                      contactMessage,
                      () => {
                        setShowContactModal(false);
                        setContactMessage("");
                      },
                      (msg) => alert(msg),
                      setSendingContact
                    );
                  }}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-300"
                  disabled={sendingContact}
                >
                  {sendingContact ? "전송 중..." : "전송하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 챗봇 위젯 */}
      {chatbotListing && <ChatbotWidget listing={chatbotListing} />}
    </main>
  );
}
