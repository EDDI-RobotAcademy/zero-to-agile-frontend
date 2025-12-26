"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useRole } from '@/lib/auth/roleContext';
import {
  getFinderRequestById,
  deleteFinderRequest,
} from '@/lib/repositories/finderRepository';
import { FinderRequestDetail } from '@/types/finder';
import {
  HOUSE_TYPE_LABEL,
  PRICE_TYPE_LABEL,
  STATUS_LABEL,
} from '@/types/finder.constants';
import { formatDate } from '@/lib/utils/dateUtils';

export default function FinderRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isReady, isAuthenticated } = useRole();
  const [request, setRequest] = useState<FinderRequestDetail | null>(null);
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
        <Card title="불러오는 중" actions={null}>
          <p className="text-slate-700">의뢰서를 불러오는 중이에요...</p>
        </Card>
      )}

      {/* 의뢰서 상세 */}
      {!loading && request && (
        <>
          {/* 최상단 헤더 영역 */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-white to-blue-50 p-8 shadow-lg ring-1 ring-slate-100">
            {/* 상단 행: 상태 배지 (좌) + 작성일/수정일 (우) */}
            <div className="mb-6 flex items-center justify-between">
              {/* 상태 배지 - 작고 심플하게 */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                    request.status === "Y"
                      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      request.status === "Y"
                        ? "bg-blue-500 animate-pulse"
                        : "bg-slate-400"
                    }`}
                  ></span>
                  {STATUS_LABEL[request.status]}
                </span>
              </div>

              {/* 작성일 · 수정일 */}
              {(request.createdAt || request.updatedAt) && (
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  {request.createdAt && (
                    <span>
                      작성일: {formatDate(request.createdAt)}
                    </span>
                  )}
                  {request.updatedAt && (
                    <span>
                      수정일: {formatDate(request.updatedAt)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 메인 행: 의뢰서 번호 */}
            <div>
              <p className="text-sm font-semibold text-sky-700">의뢰서</p>
              <h1 className="text-3xl font-extrabold text-slate-900">
                #{requestId}
              </h1>
            </div>
          </div>

          {/* CTA 버튼 영역 - 핵심 액션 */}
          <button
            onClick={() => router.push('/finder/recommendations')}
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

          {/* 본문 섹션 - 단일 카드 */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
            {/* 섹션 A: 핵심 정보 */}
            <div className="border-b border-slate-100 p-8">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h2 className="text-lg font-bold text-slate-900">핵심 정보</h2>
              </div>

              {/* 지역 + 부동산유형 / 임대유형 */}
              <div className="mb-6 border-b border-slate-100 pb-6 text-xl font-bold text-slate-900">
                {request.preferredRegion} {HOUSE_TYPE_LABEL[request.houseType]}{' '}
                <span className="text-slate-400">/</span>{' '}
                <span className="text-blue-600">
                  {PRICE_TYPE_LABEL[request.priceType]}
                </span>
              </div>

              {/* 금액 정보 - 숫자 중심 */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    보증금
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {Number(request.maxDeposit ?? 0).toLocaleString()}
                    <span className="ml-1 text-base font-normal text-slate-500">
                      원
                    </span>
                  </p>
                </div>

                {request.priceType === "MONTHLY" && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      월세
                    </p>
                    <p className="text-2xl font-extrabold text-blue-600">
                      {Number(request.maxRent ?? 0).toLocaleString()}
                      <span className="ml-1 text-base font-normal text-slate-500">
                        원
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 섹션 B: 상세 정보 */}
            {(request.roomCount || request.bathroomCount || request.additionalCondition) && (
              <div className="p-8">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-lg">📌</span>
                  <h3 className="text-lg font-bold text-slate-900">
                    상세 정보
                  </h3>
                </div>


                {/* 추가 조건 - 말풍선 느낌 */}
                {request.additionalCondition && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-base">💬</span>
                      <p className="text-sm font-semibold text-slate-500">
                        추가 조건
                      </p>
                    </div>
                    <div className="rounded-xl border-l-4 border-blue-400 bg-blue-50 p-4">
                      <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-700">
                        {request.additionalCondition}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 섹션 하단: 수정/삭제 버튼 */}
            <div className="border-t border-slate-100 px-6 py-4">
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={handleEdit}
                  className="rounded-lg px-4 py-2 text-sm"
                >
                  수정
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDelete}
                  className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
