"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import {
  createTenantRequest,
  getTenantRequestById,
  listTenantRequests,
  updateTenantRequest,
} from '@/lib/repositories/tenantRepository';
import { TenantRequestDetail, TenantRequestPayload } from '@/types/tenant';

const districts = ['영등포구', '마포구', '용산구'];
const residenceTypes = [
  { value: 'apartment', label: '아파트' },
  { value: 'officetel', label: '오피스텔' },
  { value: 'villa', label: '빌라' },
  { value: 'house', label: '단독주택' },
  { value: 'commercial', label: '상가' },
];
const dealTypes = [
  { value: 'jeonse', label: '전세' },
  { value: 'sale', label: '매매' },
  { value: 'monthly', label: '월세' },
];

export default function TenantRequestNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editIdParam = searchParams.get('id');
  const mode = searchParams.get('mode');
  const isEdit = useMemo(() => mode === 'edit' || !!editIdParam, [mode, editIdParam]);
  const [form, setForm] = useState<TenantRequestPayload>({
    preferredArea: '영등포구',
    residenceType: 'apartment',
    dealType: 'jeonse',
    budget: 80000000,
    area: 60,
    roomCount: 2,
    bathroomCount: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const id = editIdParam ? Number(editIdParam) : null;
        let detail: TenantRequestDetail | null = null;
        if (id) {
          detail = await getTenantRequestById(id);
        } else {
          const summaries = await listTenantRequests();
          if (summaries.length) {
            detail = await getTenantRequestById(summaries[0].id);
          }
        }
        if (detail) {
          setForm({
            preferredArea: detail.preferredArea ?? '영등포구',
            residenceType: detail.residenceType ?? 'apartment',
            dealType: detail.dealType ?? 'jeonse',
            budget: detail.budget ?? 0,
            area: detail.area ?? 0,
            roomCount: detail.roomCount ?? 0,
            bathroomCount: detail.bathroomCount ?? 0,
          });
        }
      } catch (err: any) {
        setError(err?.message ?? '의뢰서를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [editIdParam, isEdit]);

  const handleChange = (key: keyof TenantRequestPayload, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      if (isEdit) {
        const id = editIdParam ? Number(editIdParam) : undefined;
        const summaries = !id ? await listTenantRequests() : [];
        const targetId = id ?? summaries[0]?.id;
        if (!targetId) throw new Error('수정할 의뢰서를 찾을 수 없습니다.');
        await updateTenantRequest(targetId, form);
      } else {
        await createTenantRequest(form);
      }
      router.push('/tenant/request');
    } catch (err: any) {
      setError(err?.message ?? '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-bold">
        {isEdit ? '매물 의뢰 수정' : '매물 의뢰 작성'}
      </h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            지역(구)
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.preferredArea}
              onChange={(e) => handleChange('preferredArea', e.target.value)}
            >
              {districts.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            매물 종류
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.residenceType}
              onChange={(e) => handleChange('residenceType', e.target.value)}
            >
              {residenceTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            계약 형태
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.dealType}
              onChange={(e) => handleChange('dealType', e.target.value)}
            >
              {dealTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            예산({form.dealType === 'sale' ? '매매가' : '보증금'}, 원 단위)
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.budget}
              onChange={(e) => handleChange('budget', Number(e.target.value))}
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            최소 면적(m²)
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.area}
              onChange={(e) => handleChange('area', Number(e.target.value))}
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            방 개수
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.roomCount}
              onChange={(e) => handleChange('roomCount', Number(e.target.value))}
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            욕실 개수
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.bathroomCount}
              onChange={(e) => handleChange('bathroomCount', Number(e.target.value))}
            />
          </label>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? '저장 중...' : isEdit ? '수정 완료' : '작성 완료'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/tenant')}>
            취소
          </Button>
        </div>
      </form>
    </main>
  );
}
