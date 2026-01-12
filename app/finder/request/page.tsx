"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useRole } from '@/lib/auth/roleContext';

import {
  getFinderRequests,
  deleteFinderRequest,
} from '@/lib/repositories/finderRepository';

import { FinderRequest } from '@/types/finder';
import { STATUS_LABEL } from "@/types/houseOptions";
import {
  MapPin,
  Home,
  Wallet,
  Pencil,
  Trash2,
} from 'lucide-react';


export default function FinderRequestPage() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useRole();
  const [requests, setRequests] = useState<FinderRequest[]>([]);
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

        const data = await getFinderRequests();
        setRequests(data);

      } catch (err: any) {
        setError(err?.message ?? "의뢰서를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isReady, isAuthenticated, router]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('정말 이 의뢰서를 삭제하시겠습니까?')) return;

    try {
      await deleteFinderRequest(id);
      setRequests(requests.filter(r => r.finderRequestId !== id));
      alert('의뢰서가 삭제되었습니다.');
    } catch (error) {
      console.error('의뢰서 삭제 실패:', error);
      alert('의뢰서 삭제에 실패했습니다.');
    }
  };
 return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium tracking-tight text-blue-500 ml-0.5">
              의뢰서 관리
            </p>
            <h2 className="text-[26px] font-semibold tracking-[-0.015em] mb-1 text-slate-900">
              내 매물 의뢰서
            </h2>
            <p className="text-sm tracking-[-0.005em] leading-relaxed text-slate-500">
              작성한 의뢰서를 확인하고 관리하세요
            </p>
          </div>
          <Button
            onClick={() => router.push("/finder/request/new")}
            className="
              rounded-xl
              px-5
              py-2.5
              text-sm
              font-medium
              tracking-tight
              bg-blue-600
              text-white
              shadow-sm
              hover:bg-blue-700
              hover:shadow-md
              active:scale-[0.98]
              transition
            "
          >
            + 의뢰서 작성
          </Button>
        </div>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">의뢰서를 불러오는 중...</p>
        </div>
      )}

      {/* 의뢰서 없음 */}
      {!loading && requests.length === 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">등록된 의뢰서가 없습니다.</p>
          <Button
            onClick={() => router.push("/finder/request/new")}
            className="mt-4 rounded-xl px-6 py-3"
          >
            첫 의뢰서 작성하기
          </Button>
        </div>
      )}

      {/* 의뢰서 목록 */}
      {!loading && requests.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {requests.map((request) => {
            const statusLabel = STATUS_LABEL[request.status];

            return (
              <div
                key={request.finderRequestId}
                onClick={() => router.push(`/finder/request/${request.finderRequestId}`)}
                className="
                  group
                  flex
                  cursor-pointer
                  flex-col
                  overflow-hidden
                  rounded-3xl
                  bg-white
                  ring-1
                  ring-slate-200
                  transition
                  hover:-translate-y-1
                  hover:shadow-lg
                "
              >
                {/* 카드 헤더 */}
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
                      의뢰서 #{request.finderRequestId}
                    </h3>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                          request.status === "Y"
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 카드 내용 */}
                <div className="flex flex-1 flex-col gap-5 p-6">
                  {/* 지역 */}
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-[2px] h-4 w-4 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-slate-400">희망 지역</p>
                      <p className="mt-1 text-[14px] leading-[1.5] text-slate-700">
                        {request.preferredRegion}
                      </p>
                    </div>
                  </div>

                  {/* 매물 유형 */}
                  <div className="flex items-start gap-2">
                    <Home className="mt-[2px] h-4 w-4 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-slate-400">매물 유형</p>
                      <p className="mt-1 text-[14px] leading-[1.5] text-slate-700">
                        {request.houseType} · {request.priceType}
                      </p>
                    </div>
                  </div>

                  {/* 가격 정보 */}
                  <div className="flex items-start gap-2">
                    <Wallet className="mt-[2px] h-4 w-4 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-slate-400">희망 가격</p>
                      <p className="mt-1 text-[14px] leading-[1.5] text-slate-700">
                        보증금 {Number(request.maxDeposit ?? 0).toLocaleString()}만원
                        {request.priceType === "월세" &&
                          ` · 월세 ${Number(request.maxRent ?? 0).toLocaleString()}만원`}
                      </p>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="mt-auto flex justify-end gap-5 pt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/finder/request/${request.finderRequestId}/edit`);
                      }}
                      className="flex items-center gap-1.5 text-[13px] font-medium text-slate-400 transition hover:text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                      수정
                    </button>

                    <button
                      onClick={(e) => handleDelete(request.finderRequestId, e)}
                      className="flex items-center gap-1.5 text-[13px] font-medium text-slate-300 transition hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );

}
