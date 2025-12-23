"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import {
  createFinderRequest,
  getFinderRequestById,
  listFinderRequests,
  updateFinderRequest,
} from '@/lib/repositories/finderRepository';
import { FinderRequestDetail, FinderRequestPayload } from '@/types/finder';

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

export default function FinderRequestNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editIdParam = searchParams.get('id');
  const mode = searchParams.get('mode');
  const isEdit = useMemo(() => mode === 'edit' || !!editIdParam, [mode, editIdParam]);

  // ✅ FinderRequestPayload가 요구하는 필수 필드를 기본값으로 채워준다.
  const [form, setForm] = useState<FinderRequestPayload>({
    // --- (1) Summary 쪽 필드로 추정되는 필수값들 (타입 에러에 나온 항목들) ---
    id: 0,
    finderId: 0 as any,
    preferredRegion: '영등포구',
    priceType: 'jeonse' as any,
    maxDeposit: 80000000,
    maxRent: 0,
    houseType: 'apartment' as any,

    // --- (2) Detail 쪽 필드들 (기존 UI에서 쓰던 값들) ---
    preferredArea: '영등포구',
    residenceType: 'apartment',
    dealType: 'jeonse',
    budget: 80000000,
    area: 60,
    roomCount: 2,
    bathroomCount: 1,

    // optional일 가능성이 크지만, 혹시 필수면 빈 값으로라도 넣어두면 안전
    additionalCondition: '',
  } as any);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const id = editIdParam ? Number(editIdParam) : null;
        let detail: FinderRequestDetail | null = null;

        if (id) {
          detail = await getFinderRequestById(id);
        } else {
          const summaries = await listFinderRequests();
          if (summaries.length) {
            // ✅ id가 undefined일 수 있으니, 안전하게 number로 확정
            const targetId = summaries[0]?.id ?? summaries[0]?.finderRequestId;
            if (targetId !== undefined) {
              detail = await getFinderRequestById(targetId);
            }
          }
        }

        if (detail) {
          // ✅ setForm에서도 FinderRequestPayload 필드가 빠지지 않도록 유지/동기화
          setForm((prev) => ({
            ...prev,

            // --- Summary/필수 필드들 ---
            id: (detail as any).id ?? prev.id,
            finderId: (detail as any).finderId ?? prev.finderId,
            preferredRegion: (detail as any).preferredRegion ?? (detail.preferredArea ?? prev.preferredRegion),
            priceType: (detail as any).priceType ?? ((detail.dealType ?? prev.dealType) as any),
            maxDeposit: (detail as any).maxDeposit ?? (detail.budget ?? prev.maxDeposit),
            maxRent: (detail as any).maxRent ?? prev.maxRent,
            houseType: (detail as any).houseType ?? ((detail.residenceType ?? prev.residenceType) as any),

            // --- UI에서 쓰는 필드들 ---
            preferredArea: detail.preferredArea ?? '영등포구',
            residenceType: detail.residenceType ?? 'apartment',
            dealType: detail.dealType ?? 'jeonse',
            budget: detail.budget ?? 0,
            area: detail.area ?? 0,
            roomCount: detail.roomCount ?? 0,
            bathroomCount: detail.bathroomCount ?? 0,
            additionalCondition: detail.additionalCondition ?? prev.additionalCondition,
          }));
        }
      } catch (err: any) {
        setError(err?.message ?? '의뢰서를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [editIdParam, isEdit]);

  // ✅ UI 필드 변경 시, payload 필드도 같이 맞춰준다.
  const handleChange = (key: keyof FinderRequestPayload, value: string | number | boolean) => {
    setForm((prev) => {
      const next: any = { ...prev, [key]: value };

      // preferredArea 변경 -> preferredRegion도 같이 반영
      if (key === 'preferredArea' && typeof value === 'string') {
        next.preferredRegion = value;
      }

      // residenceType 변경 -> houseType도 같이 반영
      if (key === 'residenceType' && typeof value === 'string') {
        next.houseType = value;
      }

      // dealType 변경 -> priceType도 같이 반영
      if (key === 'dealType' && typeof value === 'string') {
        next.priceType = value;
        // 월세일 경우 maxRent를 별도로 받을 UI가 없으니, 기본 0 유지
        // 전세/매매는 maxRent=0으로 두는 게 일반적으로 안전
        if (value !== 'monthly') {
          next.maxRent = 0;
        }
      }

      // budget 변경 -> maxDeposit도 같이 반영 (UI에는 예산 1개만 있으니 deposit로 동일 세팅)
      if (key === 'budget' && typeof value === 'number') {
        next.maxDeposit = value;
        if (next.dealType !== 'monthly') {
          next.maxRent = 0;
        }
      }

      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);

      if (isEdit) {
        const id = editIdParam ? Number(editIdParam) : undefined;
        const summaries = !id ? await listFinderRequests() : [];

        // ✅ id가 없으면 summaries[0]에서 안전하게 가져오고, 그래도 없으면 finderRequestId로 대체
        const targetId = id ?? summaries[0]?.id ?? summaries[0]?.finderRequestId;

        // ✅ 0 같은 falsy 값 방지: undefined만 체크
        if (targetId === undefined) throw new Error('수정할 의뢰서를 찾을 수 없습니다.');

        await updateFinderRequest(targetId, form);
      } else {
        await createFinderRequest(form);
      }

      router.push('/finder/request');
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
                  value={form.roomCount ?? 0}
                  onChange={(e) => handleChange('roomCount', Number(e.target.value))}
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-gray-700">
              욕실 개수
              <input
                  type="number"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={form.bathroomCount ?? 0}
                  onChange={(e) => handleChange('bathroomCount', Number(e.target.value))}
              />
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? '저장 중...' : isEdit ? '수정 완료' : '작성 완료'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push('/finder')}>
              취소
            </Button>
          </div>
        </form>
      </main>
  );
}
