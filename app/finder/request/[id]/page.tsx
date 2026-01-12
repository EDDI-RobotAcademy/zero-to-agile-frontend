"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRole } from '@/lib/auth/roleContext';
import {
  getFinderRequestById,
  deleteFinderRequest,
} from '@/lib/repositories/finderRepository';
import { FinderRequest } from '@/types/finder';
import {
  STATUS_LABEL,
} from '@/types/houseOptions';
import { formatDate } from '@/lib/utils/dateUtils';
import {
  FileText,
  MapPin,
  Home,
  Wallet,
  Banknote,
  CreditCard,
  School,
  AirVent,
  WashingMachine,
  Refrigerator,
  Pencil,
  Trash2,
  Sparkles,
} from 'lucide-react';

export default function FinderRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isReady, isAuthenticated } = useRole();
  const [request, setRequest] = useState<FinderRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestId = Number(params.id);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/auth/role-select");
      return;
    }

    if (isNaN(requestId)) {
      setError("잘못된 의뢰서 ID입니다.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getFinderRequestById(requestId);
        if (!data) {
          setError("의뢰서를 찾을 수 없습니다.");
        } else {
          setRequest(data);
        }
      } catch (err: any) {
        setError(err?.message ?? "의뢰서를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isReady, isAuthenticated, requestId, router]);

  const handleDelete = async () => {
    if (!request) return;
    if (!window.confirm('의뢰서를 삭제하시겠습니까?')) return;

    try {
      await deleteFinderRequest(request.finderRequestId);
      alert('의뢰서가 성공적으로 삭제되었습니다.');
      router.push('/finder/request');
    } catch (err: any) {
      setError(err?.message ?? '삭제에 실패했습니다.');
    }
  };

  const handleEdit = () => {
    router.push(`/finder/request/${requestId}/edit`);
  };

  return (
    <main className="space-y-6">
      {/* 에러 */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">의뢰서를 불러오는 중...</p>
        </div>
      )}

      {/* 의뢰서 상세 */}
      {!loading && request && (
        <>
          {/* 최상단 헤더 영역 */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium tracking-tight text-blue-500 ml-0.5">의뢰서 상세</p>
                <h2 className="text-[26px] font-semibold tracking-[-0.015em] mb-1 text-slate-900">
                  의뢰서 #{requestId}
                </h2>
                <div className="flex gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                      request.status === "Y"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {STATUS_LABEL[request.status]}
                  </span>
                </div>
              </div>
              {(request.createdAt || request.updatedAt) && (
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  {request.createdAt && (
                    <span>작성일: {formatDate(request.createdAt)}</span>
                  )}
                  {request.updatedAt && (
                    <span>수정일: {formatDate(request.updatedAt)}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CTA 버튼 영역 - 핵심 액션 */}
          <button
            onClick={() => router.push(`/finder/recommendations?requestId=${requestId}`)}
            className="group w-full overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 to-sky-400 px-8 py-5 text-center shadow-xl ring-1 ring-blue-400 transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl transition group-hover:scale-110">
                🏠
              </span>
              <span className="text-base font-bold text-white">
                이 의뢰서로 매물 추천 받기
              </span>
              <span className="text-lg text-white opacity-80 transition group-hover:translate-x-1">
                →
              </span>
            </div>
          </button>

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
                  <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{request.preferredRegion}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Home className="mt-[2px] h-4 w-4 text-blue-400" />
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-slate-400">매물 유형</p>
                  <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{request.houseType}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Wallet className="mt-[2px] h-4 w-4 text-blue-400" />
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-slate-400">계약 유형</p>
                  <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{request.priceType}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Banknote className="mt-[2px] h-4 w-4 text-blue-400" />
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-slate-400">최대 보증금</p>
                  <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{Number(request.maxDeposit ?? 0).toLocaleString()} 만원</p>
                </div>
              </div>
              {request.priceType === "월세" && request.maxRent > 0 && (
                <div className="flex items-start gap-2">
                  <CreditCard className="mt-[2px] h-4 w-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-slate-400">최대 월세</p>
                    <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{Number(request.maxRent).toLocaleString()} 만원</p>
                  </div>
                </div>
              )}
              {request.universityName && (
                <div className="flex items-start gap-2">
                  <School className="mt-[2px] h-4 w-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-slate-400">대학교</p>
                    <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{request.universityName}</p>
                  </div>
                </div>
              )}
              {(request.roomcount || request.bathroomcount) && (
                <div className="flex items-start gap-2">
                  <Home className="mt-[2px] h-4 w-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-slate-400">방 구조</p>
                    <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">
                      {request.roomcount && `방 ${request.roomcount}개`}
                      {request.roomcount && request.bathroomcount && ' · '}
                      {request.bathroomcount && `욕실 ${request.bathroomcount}개`}
                    </p>
                  </div>
                </div>
              )}
              {request.maxBuildingAge && (
                <div className="flex items-start gap-2">
                  <Home className="mt-[2px] h-4 w-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-slate-400">건물 노후도</p>
                    <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">
                      {request.maxBuildingAge === 1 && '5년 이하'}
                      {request.maxBuildingAge === 2 && '10년 이하'}
                      {request.maxBuildingAge === 3 && '20년 이하'}
                      {request.maxBuildingAge === 4 && '30년 이하'}
                      {request.maxBuildingAge === 5 && '상관없음'}
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
                {request.isNear && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <School className="h-3.5 w-3.5" />
                    학교 근처
                  </span>
                )}
                {request.airconYn === 'Y' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <AirVent className="h-3.5 w-3.5" />
                    에어컨
                  </span>
                )}
                {request.washerYn === 'Y' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700">
                    <WashingMachine className="h-3.5 w-3.5" />
                    세탁기
                  </span>
                )}
                {request.fridgeYn === 'Y' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1.5 text-xs font-semibold text-pink-700">
                    <Refrigerator className="h-3.5 w-3.5" />
                    냉장고
                  </span>
                )}
                {!request.isNear && request.airconYn !== 'Y' && request.washerYn !== 'Y' && request.fridgeYn !== 'Y' && (
                  <span className="text-sm text-slate-500">추가 옵션 없음</span>
                )}
              </div>
            </div>
          </div>

          {/* 기타 요구사항 */}
          {request.additionalCondition && (
            <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
              <div className="border-b border-slate-100 bg-white px-6 py-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <h3 className="text-base font-semibold tracking-tight text-slate-900">기타 요구사항</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{request.additionalCondition}</p>
              </div>
            </div>
          )}

          {/* 수정/삭제 버튼 */}
          <div className="flex justify-end gap-2">
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
            >
              <Pencil className="h-3.5 w-3.5" />
              수정
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition-all hover:bg-red-50 active:scale-[0.98]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              삭제
            </button>
          </div>
        </>
      )}
    </main>
  );
}
