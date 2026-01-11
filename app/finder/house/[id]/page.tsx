"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getHousePlatformById } from '@/lib/repositories/ownerRepository';
import { HousePlatform } from '@/types/owner';

type PageProps = { params: Promise<{ id: string }> };

export default function FinderHouseDetailPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const acceptType = searchParams.get('acceptType');
  const [listing, setListing] = useState<HousePlatform | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.resolve(params).then(({ id }) => {
      if (!active) return;
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        setError('잘못된 매물 ID입니다.');
        setLoading(false);
        return;
      }

      getHousePlatformById(numericId)
        .then((data) => {
          if (active) {
            setListing(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (active) {
            setError(err?.message ?? '매물을 불러올 수 없습니다.');
            setLoading(false);
          }
        });
    });
    return () => {
      active = false;
    };
  }, [params, acceptType]);

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-slate-600">매물을 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="space-y-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-red-700">{error || '매물을 찾을 수 없습니다.'}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          뒤로 가기
        </button>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-white to-teal-50 px-8 py-8 shadow-lg ring-1 ring-emerald-100">
        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-600 p-1.5">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">House</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">{listing.title}</h1>
          <p className="text-sm text-slate-600">
            {listing.address} · {listing.residenceType} · {listing.salesType}
          </p>
        </div>
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-200/30 blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-teal-200/30 blur-2xl"></div>
      </div>

      {/* 임대인 정보 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-purple-600 p-1.5">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">임대인 정보</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📱</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-1">연락처</p>
              {acceptType === 'Y' && listing.phoneNumber ? (
                <p className="text-base font-semibold text-slate-900">{listing.phoneNumber}</p>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                  <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm font-medium text-amber-800">임대인이 컨텍 요청을 수락하면 번호가 공개됩니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 이미지 갤러리 */}
      {(() => {
        try {
          const images = JSON.parse(listing.imageUrls || '[]');
          if (Array.isArray(images) && images.length > 0) {
            return (
              <div className="grid gap-3 md:grid-cols-2">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${listing.title} ${idx + 1}`}
                    className="h-64 w-full rounded-xl object-cover shadow-md ring-1 ring-slate-200"
                  />
                ))}
              </div>
            );
          }
        } catch (e) {
          console.error('Failed to parse imageUrls', e);
        }
        return null;
      })()}

      {/* 기본 정보 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">기본 정보</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">💰 보증금:</span>
              <span className="text-slate-600">{listing.deposit.toLocaleString()} 만원</span>
            </div>
            {listing.monthlyRent > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">💸 월세:</span>
                <span className="text-slate-600">{listing.monthlyRent.toLocaleString()} 만원</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">📏 전용면적:</span>
              <span className="text-slate-600">{listing.exclusiveArea} m²</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">📐 계약면적:</span>
              <span className="text-slate-600">{listing.contractArea} m²</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">🏢 층수:</span>
              <span className="text-slate-600">{listing.floorNo}/{listing.allFloors}층</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">🏠 방 타입:</span>
              <span className="text-slate-600">{listing.roomType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">💵 관리비:</span>
              <span className="text-slate-600">{listing.manageCost} 만원</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">🚗 주차:</span>
              <span className="text-slate-600">{listing.canPark ? '가능' : '불가능'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">🛗 엘리베이터:</span>
              <span className="text-slate-600">{listing.hasElevator ? '있음' : '없음'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.back()}
        className="rounded-lg border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
      >
        뒤로 가기
      </button>
    </main>
  );
}
