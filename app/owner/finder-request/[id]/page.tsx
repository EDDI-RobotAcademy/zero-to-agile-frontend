"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFinderRequestById } from '@/lib/repositories/finderRepository';
import { FinderRequest } from '@/types/finder';

type PageProps = { params: Promise<{ id: string }> };

export default function OwnerFinderRequestDetailPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const acceptType = searchParams.get('acceptType');
  const [finderRequest, setFinderRequest] = useState<FinderRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.resolve(params).then(({ id }) => {
      if (!active) return;
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        setError('잘못된 의뢰서 ID입니다.');
        setLoading(false);
        return;
      }

      getFinderRequestById(numericId)
        .then((data) => {
          if (active) {
            setFinderRequest(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (active) {
            setError(err?.message ?? '의뢰서를 불러올 수 없습니다.');
            setLoading(false);
          }
        });
    });
    return () => {
      active = false;
    };
  }, [params]);

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-slate-600">의뢰서를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error || !finderRequest) {
    return (
      <main className="space-y-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-red-700">{error || '의뢰서를 찾을 수 없습니다.'}</p>
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 via-white to-indigo-50 px-8 py-8 shadow-lg ring-1 ring-blue-100">
        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="rounded-lg bg-blue-600 p-1.5">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Request</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">의뢰서 #{finderRequest.finderRequestId}</h1>
          <p className="text-sm text-slate-600">
            임차인의 집 찾기 요청서입니다
          </p>
        </div>
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-indigo-200/30 blur-2xl"></div>
      </div>

      {/* 임차인 정보 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-600 p-1.5">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">임차인 정보</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📱</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-1">연락처</p>
              {acceptType === 'Y' && finderRequest.phoneNumber ? (
                <p className="text-base font-semibold text-slate-900">{finderRequest.phoneNumber}</p>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                  <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm font-medium text-amber-800">임차인이 컨텍 요청을 수락하면 번호가 공개됩니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 희망 조건 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">희망 조건</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">📍 희망 지역:</span>
              <span className="text-slate-600">{finderRequest.preferredRegion || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">🏠 매물 유형:</span>
              <span className="text-slate-600">{finderRequest.houseType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">💰 계약 유형:</span>
              <span className="text-slate-600">{finderRequest.priceType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">💵 최대 보증금:</span>
              <span className="text-slate-600">{finderRequest.maxDeposit?.toLocaleString() || 0} 만원</span>
            </div>
            {finderRequest.maxRent > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">💸 최대 월세:</span>
                <span className="text-slate-600">{finderRequest.maxRent.toLocaleString()} 만원</span>
              </div>
            )}
            {/* {finderRequest.phoneNumber && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">📱 연락처:</span>
                <span className="text-slate-600">{finderRequest.phoneNumber}</span>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* 추가 옵션 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">추가 옵션</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {finderRequest.isNear && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                🏫 학교 근처
              </span>
            )}
            {finderRequest.airconYn && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                ❄️ 에어컨
              </span>
            )}
            {finderRequest.washerYn && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                🧺 세탁기
              </span>
            )}
            {finderRequest.fridgeYn && (
              <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">
                🧊 냉장고
              </span>
            )}
            {!finderRequest.isNear && !finderRequest.airconYn && !finderRequest.washerYn && !finderRequest.fridgeYn && (
              <span className="text-sm text-slate-500">추가 옵션 없음</span>
            )}
          </div>
        </div>
      </div>

      {/* 기타 조건 */}
      {finderRequest.additionalCondition && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-900">기타 요구사항</h3>
          </div>
          <div className="p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{finderRequest.additionalCondition}</p>
          </div>
        </div>
      )}

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
