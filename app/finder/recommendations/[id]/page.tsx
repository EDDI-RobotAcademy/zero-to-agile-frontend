"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { getRecommendationById } from '@/lib/repositories/recommendRepository';
import { RecommendedListing, RiskLevel } from '@/types/recommended';
import { ChatbotWidget } from '@/components/chat/ChatbotWidget';
import { addToWishlist } from '@/lib/repositories/wishlistRepository';

const LISTING_TYPE_LABEL: Record<string, string> = {
  apartment: '아파트',
  officetel: '오피스텔',
  villa: '빌라',
  house: '단독주택',
  commercial: '상가',
};

const RISK_LEVEL_CONFIG: Record<RiskLevel, { label: string; emoji: string; color: string; bgColor: string }> = {
  low: { label: '낮음', emoji: '🟢', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  medium: { label: '중간', emoji: '🟡', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
  high: { label: '높음', emoji: '🔴', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
};

export default function RecommendationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [listing, setListing] = useState<RecommendedListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const listingId = String(params.id);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getRecommendationById(listingId);
        if (!data) {
          setError('매물을 찾을 수 없습니다.');
        } else {
          setListing(data);
        }
      } catch (err: any) {
        setError(err?.message ?? '매물을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [listingId]);

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-slate-600">매물 정보를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="space-y-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error || '매물을 찾을 수 없습니다.'}</p>
        </div>
        <Button onClick={() => router.back()}>돌아가기</Button>
      </main>
    );
  }

  const riskConfig = listing.riskLevel ? RISK_LEVEL_CONFIG[listing.riskLevel] : null;

  const handleSaveToWishlist = async () => {
    alert('이 기능은 아직 준비중입니다.');
  };

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-sky-50 p-8 shadow-sm ring-1 ring-slate-100">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-4xl">🏠</span>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{listing.title}</h1>
              <p className="mt-2 text-base font-medium text-slate-700">
                📍 {listing.description}
              </p>
              <span className="mt-2 inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                {LISTING_TYPE_LABEL[listing.type]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 이미지 갤러리 */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
        {listing.images.length >= 3 ? (
          /* 3장 이상일 경우 슬라이더 */
          <div className="relative">
            <img
              src={listing.images[currentImageIndex]}
              alt={`${listing.title} - ${currentImageIndex + 1}`}
              className="h-96 w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://picsum.photos/seed/default/600/400';
              }}
            />

            {/* 이전 버튼 */}
            <button
              onClick={() => setCurrentImageIndex((prev) =>
                prev === 0 ? listing.images.length - 1 : prev - 1
              )}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition"
            >
              ◀
            </button>

            {/* 다음 버튼 */}
            <button
              onClick={() => setCurrentImageIndex((prev) =>
                prev === listing.images.length - 1 ? 0 : prev + 1
              )}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition"
            >
              ▶
            </button>

            {/* 인디케이터 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {listing.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 w-2 rounded-full transition ${
                    index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* 이미지 카운터 */}
            <div className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
              {currentImageIndex + 1} / {listing.images.length}
            </div>
          </div>
        ) : (
          /* 3장 미만일 경우 그리드 */
          <div className="grid gap-2 md:grid-cols-2">
            {listing.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${listing.title} - ${index + 1}`}
                className="h-80 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://picsum.photos/seed/default/600/400';
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 기본 정보 */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">💰 가격 정보</h2>
        </div>
        <div className="p-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                  {listing.salesType}
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-base font-semibold text-slate-700">보증금</span>
                <span className="text-4xl font-extrabold text-slate-900">
                  {listing.price.toLocaleString()}
                </span>
                <span className="text-2xl font-bold text-slate-900">만원</span>
              </div>
              {(listing.monthlyRent ?? 0) > 0 && (
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-base font-semibold text-slate-700">월세</span>
                  <span className="text-3xl font-bold text-blue-700">
                    {listing.monthlyRent!.toLocaleString()}
                  </span>
                  <span className="text-xl font-semibold text-blue-700">만원</span>
                </div>
              )}
            </div>

            {listing.manageCost && (
              <div className="flex items-baseline gap-3 rounded-xl bg-blue-50 px-5 py-3">
                <span className="text-base font-bold text-blue-900">관리비</span>
                <span className="text-2xl font-bold text-blue-900">
                  {listing.manageCost.toLocaleString()}
                </span>
                <span className="text-lg font-semibold text-blue-900">만원</span>
              </div>
            )}

            <div className="grid gap-5 border-t border-slate-200 pt-5 sm:grid-cols-3">
              <div>
                <p className="mb-1 text-sm font-medium text-slate-600">전용면적</p>
                <p className="text-2xl font-bold text-slate-900">{listing.area}<span className="text-lg font-semibold text-slate-700">m²</span></p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-slate-600">층수</p>
                <p className="text-2xl font-bold text-slate-900">
                  {listing.floor}
                  {listing.allFloors && `/${listing.allFloors}`}<span className="text-lg font-semibold text-slate-700">층</span>
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-slate-600">편의시설</p>
                <div className="flex flex-col gap-1">
                  <span className={`text-base font-semibold ${listing.hasElevator ? 'text-green-700' : 'text-slate-400'}`}>
                    {listing.hasElevator ? '✓' : '✗'} 엘리베이터
                  </span>
                  <span className={`text-base font-semibold ${listing.canPark ? 'text-green-700' : 'text-slate-400'}`}>
                    {listing.canPark ? '✓' : '✗'} 주차
                  </span>
                </div>
              </div>
            </div>

            {listing.rank && (
              <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-purple-700">#{listing.rank}</span>
                  <div>
                    <p className="text-sm font-bold text-purple-900">추천 순위</p>
                    {listing.matchScore && (
                      <p className="text-sm font-semibold text-purple-600">
                        매칭 점수 {(listing.matchScore * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 기본 제공 가전 & 관리비 정보 */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">📋 추가 정보</h2>
        </div>
        <div className="p-6">
          <div className="space-y-5">
            {/* 기본 제공 가전 */}
            {listing.options && listing.options.some(opt =>
              opt === '에어컨' || opt === '냉장고' || opt === '세탁기'
            ) && (
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-600">🔌 기본 제공 가전</p>
                <div className="flex flex-wrap gap-2">
                  {listing.options.filter(opt =>
                    opt === '에어컨' || opt === '냉장고' || opt === '세탁기'
                  ).map((item, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 관리비 포함 항목 */}
            {listing.options && listing.options.some(opt =>
              opt.includes('관리비') || opt.includes('일반')
            ) && (
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-600">✅ 관리비 포함 항목</p>
                <div className="flex flex-wrap gap-2">
                  {listing.options.filter(opt =>
                    opt.includes('관리비') || opt.includes('일반')
                  ).map((item, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 관리비 제외 항목 */}
            {listing.options && listing.options.some(opt =>
              opt === '전기' || opt === '가스' || opt === '수도' || opt === '인터넷'
            ) && (
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-600">❌ 관리비 제외 항목 (별도 납부)</p>
                <div className="flex flex-wrap gap-2">
                  {listing.options.filter(opt =>
                    opt === '전기' || opt === '가스' || opt === '수도' || opt === '인터넷' || opt === 'TV' || opt === '난방'
                  ).map((item, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI 추천 이유 */}
      {listing.aiReasons && listing.aiReasons.length > 0 && (
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <span className="text-2xl">🤖</span>
              AI 추천 이유
            </h2>
          </div>
          <div className="space-y-4 p-6">
            <div className="mb-2 rounded-xl border-2 border-green-200 bg-green-50 px-5 py-4">
              <p className="text-base font-medium leading-relaxed text-green-900">
                안녕! 이 집을 추천한 이유를 알려줄게.
              </p>
            </div>

            {listing.aiReasons.map((reason, index) => (
              <div key={index} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
                <div className="flex gap-4">
                  <span className="text-2xl flex-shrink-0">{['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][index] || '•'}</span>
                  <div className="flex-1">
                    <p className="text-base font-medium leading-relaxed text-slate-800">{reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 리스크 분석 */}
      {riskConfig && (
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className={`border-b border-slate-100 px-6 py-4 ${riskConfig.bgColor}`}>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <span className="text-2xl">⚠️</span>
              리스크 분석
            </h2>
          </div>
          <div className="space-y-4 p-6">
            <div className={`rounded-xl border-2 p-5 ${riskConfig.bgColor}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{riskConfig.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-600">종합 리스크</p>
                  <p className={`text-2xl font-extrabold ${riskConfig.color}`}>
                    {riskConfig.label}
                  </p>
                </div>
              </div>
            </div>

            {listing.riskFlags && listing.riskFlags.length > 0 ? (
              <div className="space-y-3">
                {listing.riskFlags.map((flag, index) => {
                  const severityEmoji = {
                    low: '✅',
                    medium: '⚠️',
                    high: '🔴',
                  }[flag.severity] || '•';

                  const severityColor = {
                    low: 'text-green-800',
                    medium: 'text-yellow-800',
                    high: 'text-red-800',
                  }[flag.severity] || 'text-slate-800';

                  const severityBg = {
                    low: 'bg-green-50 border-green-200',
                    medium: 'bg-yellow-50 border-yellow-200',
                    high: 'bg-red-50 border-red-200',
                  }[flag.severity] || 'bg-slate-50 border-slate-200';

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 rounded-xl border-2 p-4 ${severityBg}`}
                    >
                      <span className="text-xl flex-shrink-0">{severityEmoji}</span>
                      <p className={`text-base font-medium leading-relaxed ${severityColor}`}>{flag.message}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border-2 border-green-200 bg-green-50 p-4">
                  <span className="text-xl flex-shrink-0">✅</span>
                  <p className="text-base font-medium text-green-800">건축물대장: 이상 없음</p>
                </div>
                <div className="flex items-start gap-3 rounded-xl border-2 border-green-200 bg-green-50 p-4">
                  <span className="text-xl flex-shrink-0">✅</span>
                  <p className="text-base font-medium text-green-800">실거래가 대비: 적정</p>
                </div>
              </div>
            )}

            {listing.riskDescription && (
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
                <p className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-900">
                  <span className="text-base">💡</span>
                  주의사항
                </p>
                <p className="text-base font-medium leading-relaxed text-blue-800">
                  {listing.riskDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="flex-1 rounded-xl py-4 text-base font-semibold"
        >
          목록으로
        </Button>
        <Button
          onClick={handleSaveToWishlist}
          disabled={isSaving}
          className="flex-1 rounded-xl py-4 text-base font-semibold"
        >
          {isSaving ? '저장 중...' : '⭐ 관심 매물로 저장'}
        </Button>
      </div>

      {/* AI 챗봇 */}
      <ChatbotWidget />
    </main>
  );
}
