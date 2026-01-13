"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFinderRequestById } from '@/lib/repositories/finderRepository';
import { FinderRequest } from '@/types/finder';
import {
  FileText,
  User,
  Phone,
  Lock,
  MapPin,
  Home,
  Wallet,
  Banknote,
  CreditCard,
  School,
  AirVent,
  WashingMachine,
  Refrigerator,
  ArrowLeft,
} from 'lucide-react';

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
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium tracking-tight text-blue-500 ml-0.5">
              의뢰서 상세
            </p>
            <h2 className="text-[26px] font-semibold tracking-[-0.015em] mb-1 text-slate-900">
              의뢰서 #{finderRequest.finderRequestId}
            </h2>
            <p className="text-sm tracking-[-0.005em] leading-relaxed text-slate-500">
              임차인의 집 찾기 요청서입니다
            </p>
          </div>
        </div>
      </div>

      {/* 임차인 정보 */}
      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-400" />
            <h3 className="text-base font-semibold tracking-tight text-slate-900">임차인 정보</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start gap-2">
            <Phone className="mt-[2px] h-4 w-4 text-blue-400" />
            <div className="flex-1">
              <p className="text-[12px] font-medium text-slate-400">연락처</p>
              {acceptType === 'Y' && finderRequest.phoneNumber ? (
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{finderRequest.phoneNumber}</p>
              ) : (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-medium text-amber-800">임차인이 컨텍 요청을 수락하면 번호가 공개됩니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 희망 조건 */}
      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-400" />
            <h3 className="text-base font-semibold tracking-tight text-slate-900">희망 조건</h3>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start gap-2">
            <MapPin className="mt-[2px] h-4 w-4 text-blue-400" />
            <div className="flex-1">
              <p className="text-[12px] font-medium text-slate-400">희망 지역</p>
              <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{finderRequest.preferredRegion || '-'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Home className="mt-[2px] h-4 w-4 text-blue-400" />
            <div className="flex-1">
              <p className="text-[12px] font-medium text-slate-400">매물 유형</p>
              <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{finderRequest.houseType}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Wallet className="mt-[2px] h-4 w-4 text-blue-400" />
            <div className="flex-1">
              <p className="text-[12px] font-medium text-slate-400">계약 유형</p>
              <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{finderRequest.priceType}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Banknote className="mt-[2px] h-4 w-4 text-blue-400" />
            <div className="flex-1">
              <p className="text-[12px] font-medium text-slate-400">최대 보증금</p>
              <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{finderRequest.maxDeposit?.toLocaleString() || 0} 만원</p>
            </div>
          </div>
          {finderRequest.maxRent > 0 && (
            <div className="flex items-start gap-2">
              <CreditCard className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">최대 월세</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{finderRequest.maxRent.toLocaleString()} 만원</p>
              </div>
            </div>
          )}
          {finderRequest.universityName && (
            <div className="flex items-start gap-2">
              <School className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">대학교</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{finderRequest.universityName}</p>
              </div>
            </div>
          )}
          {(finderRequest.roomcount || finderRequest.bathroomcount) && (
            <div className="flex items-start gap-2">
              <Home className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">방 구조</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">
                  {finderRequest.roomcount && `방 ${finderRequest.roomcount}개`}
                  {finderRequest.roomcount && finderRequest.bathroomcount && ' · '}
                  {finderRequest.bathroomcount && `욕실 ${finderRequest.bathroomcount}개`}
                </p>
              </div>
            </div>
          )}
          {finderRequest.maxBuildingAge && (
            <div className="flex items-start gap-2">
              <Home className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">건물 노후도</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">
                  {finderRequest.maxBuildingAge === 1 && '5년 이하'}
                  {finderRequest.maxBuildingAge === 2 && '10년 이하'}
                  {finderRequest.maxBuildingAge === 3 && '20년 이하'}
                  {finderRequest.maxBuildingAge === 4 && '30년 이하'}
                  {finderRequest.maxBuildingAge === 5 && '상관없음'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 추가 옵션 */}
      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-blue-400" />
            <h3 className="text-base font-semibold tracking-tight text-slate-900">추가 옵션</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {finderRequest.isNear && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <School className="h-3.5 w-3.5" />
                학교 근처
              </span>
            )}
            {finderRequest.airconYn && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <AirVent className="h-3.5 w-3.5" />
                에어컨
              </span>
            )}
            {finderRequest.washerYn && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700">
                <WashingMachine className="h-3.5 w-3.5" />
                세탁기
              </span>
            )}
            {finderRequest.fridgeYn && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1.5 text-xs font-semibold text-pink-700">
                <Refrigerator className="h-3.5 w-3.5" />
                냉장고
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
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <h3 className="text-base font-semibold tracking-tight text-slate-900">기타 요구사항</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{finderRequest.additionalCondition}</p>
          </div>
        </div>
      )}

      {/* 뒤로가기 버튼 */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium tracking-tight text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          뒤로 가기
        </button>
      </div>
    </main>
  );
}
