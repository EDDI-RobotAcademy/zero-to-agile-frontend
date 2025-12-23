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
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-white to-blue-50 p-6 shadow-sm ring-1 ring-slate-100">
        <p className="text-sm font-semibold text-sky-700">의뢰서</p>
        <h2 className="text-3xl font-bold text-slate-900">
          내 매물 의뢰서
        </h2>
        <p className="text-sm text-slate-600">
          작성한 의뢰서를 한눈에 확인할 수 있어요.
        </p>
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
                <div className="group rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  {/* 상단 */}
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      의뢰서 #{request.finderRequestId}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold
                        ${
                          request.status === "Y"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }
                      `}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* 요약 */}
                  <div className="space-y-1 text-sm text-slate-700">
                    <p>
                      <span className="text-slate-500">지역 · </span>
                      {request.preferredRegion}
                    </p>

                    <p>
                      <span className="text-slate-500">임대 유형 · </span>
                      {priceTypeLabel}
                      {request.priceType === "MONTHLY" && (
                          <span className="text-slate-600">
                            {" "}
                            ({Number(request.maxRent ?? 0).toLocaleString()}원 이하)
                          </span>
                        )}
                    </p>

                    <p>
                      <span className="text-slate-500">부동산 유형 · </span>
                      {houseTypeLabel}
                    </p>

                    <p>
                      <span className="text-slate-500">최대 보증금 · </span>
                      {Number(request.maxDeposit ?? 0).toLocaleString()} 원
                    </p>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <span className="pr-2 text-xs text-slate-400 transition group-hover:text-slate-600">
                      클릭하여 상세보기 →
                    </span>
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
