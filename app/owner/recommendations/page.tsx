"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { useRole } from '@/lib/auth/roleContext';
import { getOwnerRecommendations } from '@/lib/repositories/ownerRepository';
import { sendMessage } from '@/lib/repositories/contactRepository';
import { OwnerRecommendation, HousePlatformSummary } from '@/types/owner';
import {
  Home,
  Building2,
  Sparkles,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';

export default function OwnerRecommendationsPage() {
  const router = useRouter();
  const { authFetch } = useRole();
  const [recommendations, setRecommendations] = useState<OwnerRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rentMargin, setRentMargin] = useState(5);
  const [sendingMessage, setSendingMessage] = useState<number | null>(null);
  const [explainOpenId, setExplainOpenId] = useState<number | null>(null);
  const [explainLoadingId, setExplainLoadingId] = useState<number | null>(null);
  const [explainMessages, setExplainMessages] = useState<Record<number, string>>({});

  // 메시지 모달 상태
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedHousePlatformId, setSelectedHousePlatformId] = useState<number | null>(null);
  const [selectedFinderRequestId, setSelectedFinderRequestId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState('');

  const fetchRecommendations = async (margin: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOwnerRecommendations(margin);
      setRecommendations(data);
    } catch (err: any) {
      setError(err?.message ?? '추천 결과를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(rentMargin);
  }, []);

  const handleMarginChange = (newMargin: number) => {
    setRentMargin(newMargin);
    fetchRecommendations(newMargin);
  };

  const handleOpenMessageModal = (housePlatformId: number, finderRequestId: number) => {
    setSelectedHousePlatformId(housePlatformId);
    setSelectedFinderRequestId(finderRequestId);
    setMessageContent('안녕하세요! 귀하의 의뢰서를 보고 연락드립니다. 제 매물이 조건에 맞을 것 같아 제안드립니다.');
    setMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setMessageModalOpen(false);
    setSelectedHousePlatformId(null);
    setSelectedFinderRequestId(null);
    setMessageContent('');
  };

  const handleSendMessage = async () => {
    if (!selectedHousePlatformId || !selectedFinderRequestId) return;
    if (!messageContent.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }

    try {
      setSendingMessage(selectedFinderRequestId);
      await sendMessage({
        housePlatformId: selectedHousePlatformId,
        finderRequestId: selectedFinderRequestId,
        message: messageContent,
      });
      alert('컨텍 요청을 보냈습니다.');
      handleCloseMessageModal();
    } catch (err: any) {
      alert(err?.message ?? '컨텍 요청에 실패했습니다.');
    } finally {
      setSendingMessage(null);
    }
  };

  const handleExplainClick = async (
    finderRequestId: number,
    housePlatform: OwnerRecommendation['results'][number]['housePlatform'],
    finderRequest: OwnerRecommendation['results'][number]['matchedFinderRequests'][number]
  ) => {
    if (explainOpenId === finderRequestId) {
      setExplainOpenId(null);
      return;
    }

    setExplainOpenId(finderRequestId);
    if (explainMessages[finderRequestId]) return;

    try {
      setExplainLoadingId(finderRequestId);
      const res = await authFetch('/explain/owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tone: 'formal',
          owner_house: {
            house_platform_id: housePlatform.housePlatformId,
            title: housePlatform.title,
            address: housePlatform.address,
            sales_type: housePlatform.salesType,
            residence_type: housePlatform.residenceType,
            monthly_rent: housePlatform.monthlyRent,
            deposit: housePlatform.deposit,
            room_type: housePlatform.roomType,
            gu_nm: housePlatform.guNm,
            dong_nm: housePlatform.dongNm,
          },
          finders: {
            finder_request_id: finderRequest.finderRequestId,
            abang_user_id: finderRequest.abangUserId,
            price_type: finderRequest.priceType,
            house_type: finderRequest.houseType,
            max_rent: finderRequest.maxRent,
            preferred_region: finderRequest.preferredRegion,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || '추천 이유를 불러오지 못했습니다.');
      }

      const data = await res.json();
      const message =
        typeof data?.message === 'string'
          ? data.message
          : '추천 이유를 불러오지 못했습니다.';
      setExplainMessages((prev) => ({ ...prev, [finderRequestId]: message }));
    } catch (err: any) {
      const message =
        typeof err?.message === 'string'
          ? err.message
          : '추천 이유를 불러오지 못했습니다.';
      setExplainMessages((prev) => ({ ...prev, [finderRequestId]: message }));
    } finally {
      setExplainLoadingId(null);
    }
  };

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">추천 매물을 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={() => fetchRecommendations(rentMargin)} className="mt-4">
            다시 시도
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100 via-white to-pink-50 p-8 shadow-sm ring-1 ring-purple-100">
        <div className="space-y-4">
          <div>
            <p className="text-[12px] font-medium tracking-tight text-purple-600 ml-0.5">
              AI 추천
            </p>
            <h2 className="text-[26px] font-semibold tracking-[-0.015em] mb-1 text-slate-900">
              내 매물과 매칭된 임차인
            </h2>
            <p className="text-sm tracking-[-0.005em] leading-relaxed text-slate-500">
              내 매물에 관심을 가질 만한 임차인의 요구서를 확인하세요
            </p>
          </div>

          {recommendations && (
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-purple-100">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">추천 매물</p>
                    <p className="text-xl font-bold tracking-tight text-purple-900">
                      {recommendations.totalRecommendedHouses}개
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-pink-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-pink-500" />
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">매칭된 요구서</p>
                    <p className="text-xl font-bold tracking-tight text-pink-900">
                      {recommendations.totalMatchedRequests}개
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 임대료 마진 조절 */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <label className="block space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  임대료 마진 ± {rentMargin}만원
                </span>
                <span className="text-xs text-slate-500">
                  임차인의 예산 범위를 조절하세요 
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={rentMargin}
                onChange={(e) => handleMarginChange(Number(e.target.value))}
                className="w-full"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 추천 결과 없음 */}
      {recommendations && recommendations.results.length === 0 && (
        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-12 shadow-inner">
          <div className="text-center">
            <div className="mb-5 inline-block rounded-full bg-white p-6 shadow-md">
              <Home className="h-12 w-12 text-purple-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">
              매칭된 임차인이 없습니다
            </h3>
            <p className="text-sm text-slate-500">
              임대료 마진을 조절하거나 나중에 다시 확인해주세요
            </p>
          </div>
        </div>
      )}

      {/* 추천 결과 리스트 */}
      {recommendations && recommendations.results.length > 0 && (
        <div className="space-y-6">
          {recommendations.results.map((result, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200"
            >
              {/* 매물 헤더 */}
              <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 p-2.5 shadow-sm">
                      <Home className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {result.housePlatform.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {result.housePlatform.guNm} {result.housePlatform.dongNm}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                          {result.housePlatform.salesType}
                        </span>
                        <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-700">
                          {result.matchedFinderRequests.length}명 매칭
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/owner/listings/${result.housePlatform.housePlatformId}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 transition hover:text-purple-700"
                  >
                    매물 보기
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {/* 매물 정보 요약 */}
                <div className="mb-6 rounded-xl bg-slate-50 p-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">주소</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {result.housePlatform.address}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">매물 유형</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {result.housePlatform.residenceType} · {result.housePlatform.roomType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">가격</p>
                      <p className="text-sm font-semibold text-blue-900">
                        보증금 {result.housePlatform.deposit.toLocaleString()}만원
                        {result.housePlatform.monthlyRent > 0 &&
                          ` / 월세 ${result.housePlatform.monthlyRent.toLocaleString()}만원`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 매칭된 임차인 요구서 */}
                <div className="space-y-3">
                  <h4 className="ml-3 text-sm font-bold text-slate-900">
                    매칭된 임차인 요구서 ({result.matchedFinderRequests.length}개)
                  </h4>
                  <div className="space-y-2">
                    {result.matchedFinderRequests.map((request) => (
                      <div
                        key={request.finderRequestId}
                        className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 transition hover:bg-purple-100/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-xs text-slate-500">
                              임차인 #{request.abangUserId}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {request.preferredRegion}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-white px-2 py-1 text-slate-700">
                                {request.priceType}
                              </span>
                              <span className="rounded-full bg-white px-2 py-1 text-slate-700">
                                최대 {request.maxRent.toLocaleString()}만원
                              </span>
                              <span className="rounded-full bg-white px-2 py-1 text-slate-700">
                                {request.houseType}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <Link
                                href={`/owner/finder-request/${request.finderRequestId}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                              >
                                의뢰서 보기
                              </Link>
                              <button
                                onClick={() =>
                                  handleOpenMessageModal(
                                    result.housePlatform.housePlatformId,
                                    request.finderRequestId
                                  )
                                }
                                disabled={sendingMessage === request.finderRequestId}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-700 hover:shadow-md active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
                              >
                                <MessageSquare className="h-3 w-3" />
                                컨텍하기
                              </button>
                            </div>
                            <div className="w-full max-w-[280px]">
                              <button
                                type="button"
                                onClick={() =>
                                  handleExplainClick(
                                    request.finderRequestId,
                                    result.housePlatform,
                                    request
                                  )
                                }
                                disabled={explainLoadingId === request.finderRequestId}
                                className="inline-flex w-full items-center justify-between rounded-lg border-2 border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                              >
                                왜 추천했나요? ▼
                              </button>
                              {explainOpenId === request.finderRequestId && (
                                <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                  {explainLoadingId === request.finderRequestId
                                    ? '추천 이유를 불러오는 중입니다.'
                                    : explainMessages[request.finderRequestId] ??
                                      '추천 이유를 불러오지 못했습니다.'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 메시지 전송 모달 */}
      {messageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 bg-gradient-to-br from-purple-100 via-white to-pink-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">임차인에게 컨텍하기</h3>
                <button
                  onClick={handleCloseMessageModal}
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
                임차인에게 전달할 메시지를 작성해주세요.
              </p>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="예: 안녕하세요! 귀하의 의뢰서를 보고 연락드립니다. 제 매물이 조건에 맞을 것 같아 제안드립니다."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                rows={5}
                disabled={!!sendingMessage}
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleCloseMessageModal}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                  disabled={!!sendingMessage}
                >
                  취소
                </button>
                <button
                  onClick={handleSendMessage}
                  className="flex-1 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 active:scale-[0.98] disabled:bg-slate-300"
                  disabled={!!sendingMessage}
                >
                  {sendingMessage ? '전송 중...' : '전송하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
