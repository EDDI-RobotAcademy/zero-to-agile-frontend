"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useRole } from '@/lib/auth/roleContext';
import {
  deleteTenantRequest,
  getTenantRequestById,
  listTenantRequests,
} from '@/lib/repositories/tenantRepository';
import { TenantRequestDetail } from '@/types/tenant';

const RESIDENCE_LABEL: Record<string, string> = {
  apartment: '아파트',
  officetel: '오피스텔',
  villa: '빌라',
  house: '단독주택',
  commercial: '상가',
};

const DEAL_LABEL: Record<string, string> = {
  jeonse: '전세',
  sale: '매매',
  monthly: '월세',
};

export default function TenantRequestPage() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useRole();
  const [request, setRequest] = useState<TenantRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace('/auth/role-select');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const summaries = await listTenantRequests();
        if (!summaries.length) {
          setRequest(null);
          return;
        }
        const detail = await getTenantRequestById(summaries[0].id);
        setRequest(detail);
      } catch (err: any) {
        setError(err?.message ?? '의뢰서를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isReady, isAuthenticated, router]);

  const handleDelete = async () => {
    if (!request) return;
    if (!window.confirm('의뢰서를 삭제하시겠습니까?')) return;
    try {
      await deleteTenantRequest(request.id);
      setRequest(null);
    } catch (err: any) {
      setError(err?.message ?? '삭제에 실패했습니다.');
    }
  };

  if (!request) {
    return (
      <main className="space-y-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-white to-blue-50 p-6 shadow-sm ring-1 ring-slate-100">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-sky-700">의뢰서</p>
            <h2 className="text-3xl font-bold text-slate-900">내 매물 의뢰서</h2>
            <p className="text-sm text-slate-600">간단히 작성하면 맞춤 매물 추천이 시작돼요.</p>
          </div>
        </div>
        <Card title="의뢰서 없음" actions={null}>
          <p className="text-slate-700">
            {loading ? '불러오는 중...' : '아직 의뢰서를 작성하지 않았습니다.'}
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && (
            <Button className="mt-4 w-full rounded-xl py-3" onClick={() => (window.location.href = '/tenant/request/new')}>
              지금 작성하기
            </Button>
          )}
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-white to-blue-50 p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-sky-700">의뢰서</p>
            <h2 className="text-3xl font-bold text-slate-900">내 매물 의뢰서</h2>
            <p className="text-sm text-slate-600">요약을 확인하고 필요하면 바로 수정하세요.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/tenant/request/new?mode=edit&id=${request.id}`}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
            >
              수정하기
            </Link>
            <button
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:-translate-y-0.5 hover:border-red-300"
              onClick={handleDelete}
            >
              삭제하기
            </button>
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Card title="요약" actions={null}>
        <dl className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.08em] text-slate-500">지역</dt>
            <dd className="text-base font-semibold text-slate-900">{request.preferredArea}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.08em] text-slate-500">매물 종류</dt>
            <dd className="text-base font-semibold text-slate-900">
              {RESIDENCE_LABEL[request.residenceType] ?? request.residenceType}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.08em] text-slate-500">계약 형태</dt>
            <dd className="text-base font-semibold text-slate-900">
              {DEAL_LABEL[request.dealType] ?? request.dealType}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.08em] text-slate-500">
              예산 ({request.dealType === 'sale' ? '매매가' : '보증금'})
            </dt>
            <dd className="text-base font-semibold text-slate-900">
              {request.budget.toLocaleString()} 원
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.08em] text-slate-500">최소 면적</dt>
            <dd className="text-base font-semibold text-slate-900">{request.area} m²</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.08em] text-slate-500">방/욕실</dt>
            <dd className="text-base font-semibold text-slate-900">
              {request.roomCount} / {request.bathroomCount}
            </dd>
          </div>
        </dl>
        <Button className="mt-5 w-full rounded-xl py-3" onClick={() => (window.location.href = '/tenant/listings')}>
          이 조건으로 추천 매물 보기
        </Button>
      </Card>
    </main>
  );
}
