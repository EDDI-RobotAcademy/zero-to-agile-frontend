"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { listRecommendations } from '@/lib/repositories/recommendRepository';
import { getFinderRequestById, listFinderRequests } from '@/lib/repositories/finderRepository';
import { RecommendedListing, RiskLevel } from '@/types/recommended';
import { FinderRequestDetail } from '@/types/finder';

type TaskStatus = 'IDLE' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'TIMEOUT' | 'ERROR';

const LISTING_TYPE_LABEL: Record<string, string> = {
  apartment: '아파트',
  officetel: '오피스텔',
  villa: '빌라',
  house: '단독주택',
  commercial: '상가',
};

const CONTRACT_TYPE_LABEL: Record<string, string> = {
  jeonse: '전세',
  sale: '매매',
};

const SALES_TYPE_LABEL: Record<string, string> = {
  '전세': '전세',
  '월세': '월세',
  '매매': '매매',
};

const RISK_LEVEL_CONFIG: Record<RiskLevel, { label: string; emoji: string; color: string; bgColor: string }> = {
  low: { label: '낮음', emoji: '🟢', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  medium: { label: '중간', emoji: '🟡', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
  high: { label: '높음', emoji: '🔴', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
};

export default function FinderRecommendationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [request, setRequest] = useState<FinderRequestDetail | null>(null);
  const [listings, setListings] = useState<RecommendedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('IDLE');

  // 중복 요청 방지
  const hasStartedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const requestId = searchParams.get('requestId');

    // isMounted를 항상 true로 초기화 (cleanup 후 재마운트 대비)
    isMountedRef.current = true;

    // requestId가 있으면 큐 처리 (폴링)
    if (requestId && !hasStartedRef.current) {
      hasStartedRef.current = true;

      async function startRecommendation() {
        try {
          setLoading(true);
          setTaskStatus('QUEUED');

          // 의뢰서 정보 가져오기
          const detail = await getFinderRequestById(Number(requestId));
          setRequest(detail);

          // 1️⃣ 추천 요청 (큐에 작업 추가)
          console.log('[DEBUG] 추천 요청 시작, requestId:', requestId);
          const res = await fetch('/api/search_house', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ finder_request_id: Number(requestId) }),
          });

          console.log('[DEBUG] 추천 요청 응답 상태:', res.status);

          if (!res.ok) {
            throw new Error('추천 요청에 실패했습니다.');
          }

          const responseData = await res.json();
          console.log('[DEBUG] 추천 요청 응답 데이터:', responseData);

          const { search_house_id } = responseData;
          console.log('[DEBUG] search_house_id:', search_house_id);

          if (!search_house_id) {
            throw new Error('search_house_id를 받지 못했습니다.');
          }

          setTaskStatus('PROCESSING');

          // 2️⃣ 폴링 시작 (2초마다 상태 확인)
          console.log('[DEBUG] 폴링 시작, isMounted:', isMountedRef.current);
          const startTime = Date.now();

          while (isMountedRef.current) {
            console.log('[DEBUG] 폴링 요청 시작, search_house_id:', search_house_id);
            const pollRes = await fetch(`/api/search_house/${search_house_id}`);
            const pollData = await pollRes.json();

            console.log('[DEBUG] 폴링 응답:', pollData);
            setTaskStatus(pollData.status?.toUpperCase() || 'PROCESSING');

            if (pollData.status === 'COMPLETED') {
              // 결과가 응답에 포함되어 있음
              setListings(pollData.result || []);
              setTaskStatus('COMPLETED');
              setLoading(false);
              break;
            }

            // 타임아웃 (30초)
            if (Date.now() - startTime > 30000) {
              setTaskStatus('TIMEOUT');
              setError('추천 요청 시간이 초과되었습니다. 다시 시도해주세요.');
              setLoading(false);
              break;
            }

            // 2초 대기
            await new Promise((r) => setTimeout(r, 2000));
          }
        } catch (err: any) {
          if (isMountedRef.current) {
            setTaskStatus('ERROR');
            setError(err?.message ?? '추천 매물을 불러오지 못했습니다.');
            setLoading(false);
          }
        }
      }

      startRecommendation();

      return () => {
        isMountedRef.current = false;
      };
    }
    // requestId가 없으면 기존 로직 (목록 조회)
    // else {
    //   (async () => {
    //     try {
    //       setLoading(true);
    //       const summaries = await listFinderRequests();
    //       if (summaries.length) {
    //         const targetId = summaries[0]?.id ?? summaries[0]?.finderRequestId;
    //         if (targetId !== undefined) {
    //           const detail = await getFinderRequestById(targetId);
    //           setRequest(detail);
    //           const rec = await listRecommendations(detail ?? undefined);
    //           setListings(rec);
    //           return;
    //         }
    //       }
    //       const rec = await listRecommendations(undefined);
    //       setListings(rec);
    //     } catch (err: any) {
    //       if (err?.message === 'UNAUTHENTICATED') {
    //         router.replace('/auth/role-select');
    //         return;
    //       }
    //       setError(err?.message ?? '추천 매물을 불러오지 못했습니다.');
    //     } finally {
    //       setLoading(false);
    //     }
    //   })();
    // }
  }, []); // 빈 배열: 마운트 시 한 번만 실행

  if (loading) {
    // 상태별 로딩 메시지
    const statusMessages: Record<TaskStatus, { title: string; description: string; emoji: string }> = {
      IDLE: {
        title: '추천 준비 중...',
        description: '잠시만 기다려주세요',
        emoji: '⏳',
      },
      QUEUED: {
        title: '추천 요청이 접수되었습니다',
        description: '곧 AI가 매물 분석을 시작합니다...',
        emoji: '📋',
      },
      PROCESSING: {
        title: 'AI가 매물을 분석하고 있어요',
        description: 'RAG 검색 + 리스크 분석 + LLM 생성 중...',
        emoji: '🏠',
      },
      COMPLETED: {
        title: '추천 완료!',
        description: '결과를 불러오는 중입니다...',
        emoji: '✅',
      },
      TIMEOUT: {
        title: '시간 초과',
        description: '다시 시도해주세요',
        emoji: '⏰',
      },
      ERROR: {
        title: '오류 발생',
        description: '다시 시도해주세요',
        emoji: '❌',
      },
    };

    const currentMessage = statusMessages[taskStatus] || statusMessages.IDLE;

    return (
      <main className="space-y-6">
        {/* 로딩 화면 */}
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="h-24 w-24 animate-spin rounded-full border-8 border-slate-200 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">{currentMessage.emoji}</span>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900">{currentMessage.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{currentMessage.description}</p>
            <p className="mt-4 text-xs text-slate-400">
              현재 상태: <span className="font-semibold text-blue-600">{taskStatus}</span>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-sky-50 p-8 shadow-sm ring-1 ring-slate-100">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-blue-700">AI 추천</p>
          <h2 className="text-3xl font-bold text-slate-900">추천 매물</h2>
          {request && (
            <p className="text-sm text-slate-600">
              {request.preferredRegion} · {LISTING_TYPE_LABEL[request.houseType] || request.houseType}
            </p>
          )}
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 매물 없음 */}
      {!error && listings.length === 0 && (
        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl bg-slate-50 p-12">
          <div className="text-center">
            <p className="text-5xl">🏠</p>
            <p className="mt-4 text-lg font-semibold text-slate-700">추천 매물이 없습니다</p>
            <p className="mt-2 text-sm text-slate-500">조건을 변경하거나 나중에 다시 확인해주세요</p>
          </div>
        </div>
      )}

      {/* 매물 리스트 */}
      <div className="space-y-4">
        {listings.map((listing, index) => {
          const riskConfig = listing.riskLevel ? RISK_LEVEL_CONFIG[listing.riskLevel] : null;

          return (
            <div
              key={listing.id}
              onClick={() => router.push(`/finder/recommendations/${listing.id}`)}
              className="cursor-pointer overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 transition hover:shadow-2xl hover:ring-2 hover:ring-blue-400"
            >
              {/* 매물 헤더 */}
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏠</span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        매물 #{index + 1} - {listing.description} {LISTING_TYPE_LABEL[listing.type]}
                      </h3>
                      <p className="text-xs text-slate-500">{listing.title}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-6 md:grid-cols-3">
                  {/* 이미지 */}
                  <div className="md:col-span-1">
                    <div className="h-full w-full overflow-hidden rounded-2xl shadow-md">
                      <img
                        src={listing.images[0] || 'https://picsum.photos/seed/default/600/400'}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://picsum.photos/seed/default/600/400';
                        }}
                      />
                    </div>
                  </div>

                  {/* 정보 */}
                  <div className="flex flex-col space-y-4 md:col-span-2">
                    {/* 가격 정보 */}
                    <div className="rounded-xl bg-blue-50 p-4">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-2xl">💰</span>
                        <span className="text-sm font-semibold text-blue-700">
                          {listing.salesType || CONTRACT_TYPE_LABEL[listing.contractType]}
                        </span>
                        <span className="text-sm font-semibold text-slate-600">
                          보증금
                        </span>
                        <span className="text-2xl font-bold text-blue-900">
                          {listing.price.toLocaleString()}원
                        </span>
                        {listing.monthlyRent && (
                          <span className="text-lg text-blue-700">
                            / 월 {listing.monthlyRent.toLocaleString()}원
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 주소 */}
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="text-lg">📍</span>
                      <span className="text-sm font-medium">{listing.description}</span>
                    </div>

                    {/* AI 추천 이유 */}
                    {listing.aiReason && (
                      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-base">✅</span>
                          <span className="text-xs font-bold uppercase tracking-wide text-green-700">
                            AI 추천 이유
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-green-900">
                          "{listing.aiReason}"
                        </p>
                      </div>
                    )}

                    {/* 리스크 정보 */}
                    {riskConfig && (
                      <div className={`rounded-xl border p-4 ${riskConfig.bgColor}`}>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-base">⚠️</span>
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                            리스크
                          </span>
                          <span className={`text-sm font-bold ${riskConfig.color}`}>
                            {riskConfig.emoji} {riskConfig.label}
                          </span>
                        </div>
                        {listing.riskDescription && (
                          <p className={`text-sm leading-relaxed ${riskConfig.color}`}>
                            {listing.riskDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
