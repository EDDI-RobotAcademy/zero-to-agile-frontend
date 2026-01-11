"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { getOwnerRecommendations } from '@/lib/repositories/ownerRepository';
import { sendMessage } from '@/lib/repositories/contactRepository';
import { OwnerRecommendation, HousePlatformSummary } from '@/types/owner';

const SALES_TYPE_LABEL: Record<string, string> = {
  MONTHLY: '월세',
  JEONSE: '전세',
  SALE: '매매',
};

const RESIDENCE_TYPE_LABEL: Record<string, string> = {
  ONE_ROOM: '원룸',
  TWO_ROOM: '투룸',
  THREE_ROOM: '쓰리룸',
  OFFICETEL: '오피스텔',
  APARTMENT: '아파트',
  VILLA: '빌라',
};

export default function OwnerRecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<OwnerRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rentMargin, setRentMargin] = useState(5);
  const [sendingMessage, setSendingMessage] = useState<number | null>(null);

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
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100 via-white to-pink-50 p-8 shadow-sm ring-1 ring-slate-100">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-purple-700">AI 추천</p>
            <h2 className="text-3xl font-bold text-slate-900">내 매물과 매칭된 임차인</h2>
            <p className="text-sm text-slate-600">
              내 매물에 관심을 가질 만한 임차인의 요구서를 확인하세요.
            </p>
          </div>

          {recommendations && (
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white px-4 py-2 shadow-sm">
                <p className="text-xs text-slate-500">추천 매물</p>
                <p className="text-2xl font-bold text-purple-900">
                  {recommendations.totalRecommendedHouses}개
                </p>
              </div>
              <div className="rounded-xl bg-white px-4 py-2 shadow-sm">
                <p className="text-xs text-slate-500">매칭된 요구서</p>
                <p className="text-2xl font-bold text-pink-900">
                  {recommendations.totalMatchedRequests}개
                </p>
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
                  임차인의 예산 범위를 조절하세요 (실제 API에서만 동작)
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
              <p className="text-xs text-slate-400">
                * 목데이터 모드에서는 마진 조절이 반영되지 않습니다
              </p>
            </label>
          </div>
        </div>
      </div>

      {/* 추천 결과 없음 */}
      {recommendations && recommendations.results.length === 0 && (
        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl bg-slate-50 p-12">
          <div className="text-center">
            <p className="text-5xl">🏠</p>
            <p className="mt-4 text-lg font-semibold text-slate-700">
              매칭된 임차인이 없습니다
            </p>
            <p className="mt-2 text-sm text-slate-500">
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
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏠</span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {result.housePlatform.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {result.housePlatform.guNm} {result.housePlatform.dongNm}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                          {SALES_TYPE_LABEL[result.housePlatform.salesType] || result.housePlatform.salesType}
                        </span>
                        <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-700">
                          {result.matchedFinderRequests.length}명 매칭
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/owner/listings/${result.housePlatform.housePlatformId}`}
                    className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    매물 보기 →
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
                        {RESIDENCE_TYPE_LABEL[result.housePlatform.residenceType] || result.housePlatform.residenceType} · {result.housePlatform.roomType}
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
                  <h4 className="text-sm font-bold text-slate-900">
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
                          <div className="flex gap-2">
                            <Link
                              href={`/owner/finder-request/${request.finderRequestId}`}
                              className="rounded-lg border-2 border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
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
                              className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:bg-slate-300"
                            >
                              컨텍하기
                            </button>
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
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">컨텍 메시지 전송</h3>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              임차인에게 보낼 메시지를 작성해주세요.
            </p>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="메시지를 입력하세요..."
              rows={6}
              className="w-full rounded-lg border-2 border-slate-200 p-3 text-sm focus:border-purple-500 focus:outline-none"
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCloseMessageModal}
                disabled={!!sendingMessage}
                className="flex-1 rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!!sendingMessage}
                className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:bg-slate-400"
              >
                {sendingMessage ? '전송 중...' : '보내기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
