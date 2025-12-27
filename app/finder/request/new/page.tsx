"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { useRole } from '@/lib/auth/roleContext';
import {
  createFinderRequest,
} from '@/lib/repositories/finderRepository';
import { HouseType, PriceType } from '@/types/finder';
import {
  HOUSE_TYPE_LABEL,
  PRICE_TYPE_LABEL,
} from '@/types/finder.constants';
import { DISTRICTS, DISTRICT_TO_DONG } from '@/lib/constants/districts';

export default function FinderRequestNewPage() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useRole();

  const [district, setDistrict] = useState<string>('');
  const [dong, setDong] = useState<string>('');

  const [form, setForm] = useState({
    houseType: 'APARTMENT' as HouseType,
    priceType: 'JEONSE' as PriceType,
    maxDeposit: 0,
    maxRent: 0,
    school: '서강대학교',
    additionalCondition: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dongs = DISTRICT_TO_DONG[district] ?? [];

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/auth/role-select");
      return;
    }
  }, [isReady, isAuthenticated, router]);

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setDong(''); // 구 변경 시 동 초기화
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!district.trim()) {
      setError('희망 지역(구)을 선택해주세요.');
      return;
    }

    if (form.maxDeposit <= 0) {
      setError('보증금을 입력해주세요.');
      return;
    }

    // "구 동" 형식으로 조합 (동이 없으면 구만)
    const preferredRegion = dong ? `${district} ${dong}` : district;

    try {
      setLoading(true);
      await createFinderRequest({
        preferredRegion,
        priceType: form.priceType,
        maxDeposit: form.maxDeposit,
        maxRent: form.maxRent,
        houseType: form.houseType,
        additionalCondition: form.additionalCondition,
      });
      alert('의뢰서가 성공적으로 등록되었습니다.');
      router.push('/finder/request');
    } catch (err: any) {
      setError(err?.message ?? '의뢰서 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-slate-100">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-sky-700">의뢰서 작성</p>
          <h2 className="text-3xl font-bold text-slate-900">
            새 매물 의뢰서
          </h2>
          <p className="text-sm text-slate-600">
            원하시는 매물 조건을 입력하면 AI가 추천해드려요.
          </p>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 섹션 A: 핵심 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h3 className="text-lg font-bold text-slate-900">핵심 정보</h3>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {/* 희망 지역 - 구/동 선택 */}
            <div className="block space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🗺️</span>
                <span className="text-sm font-semibold text-slate-700">
                  희망 지역
                </span>
                <span className="text-xs text-red-500">*</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* 구 선택 */}
                <select
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  required
                >
                  <option value="">구 선택</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* 동 선택 */}
                <select
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                  value={dong}
                  onChange={(e) => setDong(e.target.value)}
                  disabled={!district}
                >
                  <option value="">{dongs.length === 0 ? '구 전체' : '동 선택'}</option>
                  {dongs.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 부동산 유형 & 임대 유형 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏠</span>
                  <span className="text-sm font-semibold text-slate-700">
                    부동산 유형
                  </span>
                  <span className="text-xs text-red-500">*</span>
                </div>
                <select
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                  value={form.houseType}
                  onChange={(e) => setForm({ ...form, houseType: e.target.value as HouseType })}
                  required
                >
                  {Object.entries(HOUSE_TYPE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">📄</span>
                  <span className="text-sm font-semibold text-slate-700">
                    임대 유형
                  </span>
                  <span className="text-xs text-red-500">*</span>
                </div>
                <select
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                  value={form.priceType}
                  onChange={(e) => setForm({ ...form, priceType: e.target.value as PriceType })}
                  required
                >
                  {Object.entries(PRICE_TYPE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* 금액 정보 ! */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2">
                <span className="text-base">💰</span>
                <span className="text-sm font-semibold text-slate-700">금액 정보</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      최대 보증금
                    </span>
                    <span className="text-xs text-red-500">*</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      value={form.maxDeposit || ''}
                      onChange={(e) => setForm({ ...form, maxDeposit: Number(e.target.value) })}
                      placeholder="10000"
                      required
                    />
                    <span className="text-sm font-semibold text-slate-600">만원</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    현재: {Number(form.maxDeposit || 0).toLocaleString()} 만원
                  </p>
                </label>

                {form.priceType === 'MONTHLY' && (
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      최대 월세
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        value={form.maxRent || ''}
                        onChange={(e) => setForm({ ...form, maxRent: Number(e.target.value) })}
                        placeholder="50"
                      />
                      <span className="text-sm font-semibold text-slate-600">만원</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      현재: {Number(form.maxRent || 0).toLocaleString()} 만원
                    </p>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 섹션 B: 상세 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📌</span>
              <h3 className="text-lg font-bold text-slate-900">상세 정보</h3>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {/* 학교 */}
            <label className="block space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🏫</span>
                <span className="text-sm font-semibold text-slate-700">학교</span>
              </div>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={form.school}
                onChange={(e) => setForm({ ...form, school: e.target.value })}
                placeholder="예: 서울대, 연세대"
              />
            </label>

            {/* 추가 조건 */}
            <label className="block space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">💬</span>
                <span className="text-sm font-semibold text-slate-700">추가 조건</span>
              </div>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={form.additionalCondition}
                onChange={(e) => setForm({ ...form, additionalCondition: e.target.value })}
                placeholder="원하시는 추가 조건을 자유롭게 작성해주세요. (예: 햇빛이 잘 들었으면 좋겠어요)"
                rows={4}
              />
            </label>
          </div>
        </div>

        {/* 하단 버튼 - 오른쪽 정렬 */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/finder/request')}
            className="rounded-xl px-6 py-3 text-base"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl px-8 py-3 text-base"
          >
            {loading ? '등록 중...' : '의뢰서 등록'}
          </Button>
        </div>
      </form>
    </main>
  );
}
