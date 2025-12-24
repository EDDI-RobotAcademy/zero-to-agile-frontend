"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useRole } from '@/lib/auth/roleContext';
import {
  listFinderRequests,
} from '@/lib/repositories/finderRepository';
import { FinderRequestSummary } from '@/types/finder';
import {
  HOUSE_TYPE_LABEL,
  PRICE_TYPE_LABEL,
  STATUS_LABEL
} from '@/types/finder.constants';


export default function FinderRequestPage() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useRole();
  const [requests, setRequests] = useState<FinderRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/auth/role-select");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await listFinderRequests();
        setRequests(data);

      } catch (err: any) {
        setError(err?.message ?? "의뢰서를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isReady, isAuthenticated, router]);

  // 이건 상세조회로
  const handleDelete = async () => {
    // if (!request) return;
    // if (!window.confirm('의뢰서를 삭제하시겠습니까?')) return;
    // try {
    //   await deleteFinderRequest(request.id);
    //   setRequest(null);
    // } catch (err: any) {
    //   setError(err?.message ?? '삭제에 실패했습니다.');
    // }
  };
 return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-sky-700">의뢰서</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-slate-900">
                내 매물 의뢰서
              </h2>
              {!loading && requests.length > 0 && (
                <span className="text-lg font-semibold text-sky-600">
                  ({requests.length}개)
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">
              작성한 의뢰서를 한눈에 확인할 수 있어요.
            </p>
          </div>
          <Button
            onClick={() => router.push("/finder/request/new")}
            className="rounded-xl px-5 py-2.5 text-sm shadow-sm"
          >
            + 새 의뢰서 작성
          </Button>
        </div>
      </div>

      {/* 에러 */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* 로딩 */}
      {loading && (
        <Card title="불러오는 중" actions={null}>
          <p className="text-slate-700">
            의뢰서를 불러오는 중이에요...
          </p>
        </Card>
      )}

      {/* 의뢰서 없음 */}
      {!loading && requests.length === 0 && (
        <Card title="의뢰서 없음" actions={null}>
          <p className="text-slate-700">
            아직 의뢰서를 작성하지 않았습니다.
          </p>
          <Button
            className="mt-4 w-full rounded-xl py-3"
            onClick={() => router.push("/finder/request/new")}
          >
            지금 작성하기
          </Button>
        </Card>
      )}

      {/* 의뢰서 목록 (작은 카드 여러 개) */}
      {!loading && requests.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => {
            const statusLabel = STATUS_LABEL[request.status];
            const houseTypeLabel = HOUSE_TYPE_LABEL[request.houseType];
            const priceTypeLabel = PRICE_TYPE_LABEL[request.priceType];

            return (
              <button
                key={request.finderRequestId}
                type="button"
                onClick={() =>
                  router.push(`/finder/request/${request.finderRequestId}`)
                }
                className="text-left"
              >
                <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:border-blue-200">
                  {/* 상단 */}
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">
                        의뢰서 #{request.finderRequestId}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
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
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="space-y-3 p-4">
                    {/* 지역 */}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-base">🗺️</span>
                      {request.preferredRegion}
                    </div>

                    {/* 부동산 유형 + 임대 유형 */}
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="text-base">🏠</span>
                      {houseTypeLabel} · {priceTypeLabel}
                    </div>

                    {/* 금액 강조 */}
                    <div className="flex items-baseline gap-2 border-t border-slate-100 pt-3">
                      <span className="text-base">💰</span>
                      <div>
                        <p className="text-xs text-slate-500">보증금</p>
                        <p className="text-lg font-bold text-slate-900">
                          {Number(request.maxDeposit ?? 0).toLocaleString()}
                          <span className="ml-1 text-sm font-normal text-slate-500">
                            원
                          </span>
                        </p>
                      </div>
                      {request.priceType === "MONTHLY" && (
                        <div className="ml-auto">
                          <p className="text-xs text-slate-500">월세</p>
                          <p className="text-lg font-bold text-blue-600">
                            {Number(request.maxRent ?? 0).toLocaleString()}
                            <span className="ml-1 text-sm font-normal text-slate-500">
                              원
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </main>
  );

}
