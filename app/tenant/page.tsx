"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useRole } from '@/lib/auth/roleContext';
import { listTenantRequests, getTenantRequestById } from '@/lib/repositories/tenantRepository';
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

export default function TenantHomePage() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useRole();
  const [request, setRequest] = useState<TenantRequestDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace('/auth/role-select');
      return;
    }
    (async () => {
      try {
        setError(null);
        const summaries = await listTenantRequests();
        if (summaries.length === 0) {
          setRequest(null);
          return;
        }
        const detail = await getTenantRequestById(summaries[0].id);
        setRequest(detail);
      } catch (err: any) {
        setError(err?.message ?? '의뢰서를 불러오지 못했습니다.');
      }
    })();
  }, [isReady, isAuthenticated, router]);

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-white to-emerald-50 p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-sky-700">임차인 홈</p>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">내 의뢰서와 매칭</h2>
            <p className="text-sm text-slate-600">요청서를 업데이트하고 바로 추천 매물을 확인하세요.</p>
          </div>
          <div className="flex gap-2">
            <Link
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
              href="/tenant/request"
            >
              내 의뢰서 보기
            </Link>
            <Link
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
              href="/tenant/contacts"
            >
              컨택 현황
            </Link>
          </div>
        </div>
      </section>

      {!request ? (
        <Card title="내 매물 의뢰서" actions={null}>
          <p className="text-slate-700">{error ?? '아직 작성한 매물 의뢰서가 없습니다.'}</p>
          <Button className="mt-4 w-full rounded-xl py-3" onClick={() => (window.location.href = '/tenant/request/new')}>
            매물 의뢰 작성하기
          </Button>
          <Link className="mt-3 block text-sm font-semibold text-sky-700 underline" href="/tenant/request">
            내 의뢰서 페이지로 이동
          </Link>
        </Card>
      ) : (
        <Card
          title="내 의뢰서 요약"
          actions={
            <Link className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5" href="/tenant/request">
              상세보기
            </Link>
          }
        >
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
              <dd className="text-base font-semibold text-slate-900">{request.budget.toLocaleString()} 만원</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="rounded-xl px-5 py-2.5" onClick={() => (window.location.href = '/tenant/listings')}>
              추천 매물 보러가기
            </Button>
            <Button
              className="rounded-xl px-5 py-2.5"
              variant="secondary"
              onClick={() => (window.location.href = '/tenant/contacts')}
            >
              임대인 컨택 확인하기
            </Button>
          </div>
        </Card>
      )}
    </main>
  );
}
