"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { SchoolSearchInput } from '@/components/common/SchoolSearchInput';
import { useRole } from '@/lib/auth/roleContext';
import {
  getFinderRequestById,
  updateFinderRequest,
} from '@/lib/repositories/finderRepository';
import { HouseType, PriceType, FinderRequestStatus } from '@/types/finder';
import {
  HOUSE_TYPE_LABEL,
  PRICE_TYPE_LABEL,
  STATUS_LABEL,
} from '@/types/finder.constants';
import { DISTRICTS, DISTRICT_TO_DONG } from '@/lib/constants/districts';

export default function FinderRequestEditPage() {
  const router = useRouter();
  const params = useParams();
  const { isReady, isAuthenticated } = useRole();

  const requestId = Number(params.id);

  const [district, setDistrict] = useState<string>('');
  const [dong, setDong] = useState<string>('');

  const [form, setForm] = useState({
    status: 'Y' as FinderRequestStatus,
    houseType: 'APARTMENT' as HouseType,
    priceType: 'JEONSE' as PriceType,
    maxDeposit: 0,
    maxRent: 0,
    school: '',
    additionalCondition: '',
    phoneNumber: '',
    isNear: 'n',
    airconYn: 'n',
    washerYn: 'n',
    fridgeYn: 'n',
    useaprYear: 0,
  });

  const [userPhone, setUserPhone] = useState<string | undefined>(undefined);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dongs = DISTRICT_TO_DONG[district] ?? [];

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/auth/role-select");
      return;
    }

    if (isNaN(requestId)) {
      setError("잘못된 의뢰서 ID입니다.");
      setDataLoading(false);
      return;
    }

    // 기존 의뢰서 데이터 불러오기
    (async () => {
      try {
        setDataLoading(true);
        setError(null);

        const data = await getFinderRequestById(requestId);
        if (!data) {
          setError("의뢰서를 찾을 수 없습니다.");
        } else {
          // preferredRegion을 파싱하여 구/동 분리
          const region = data.preferredRegion || '';
          const parts = region.trim().split(' ');
          const parsedDistrict = parts[0] || '';
          const parsedDong = parts[1] || '';

          setDistrict(parsedDistrict);
          setDong(parsedDong);

          // 불러온 데이터로 폼 초기화
          setForm({
            status: data.status || 'Y',
            houseType: data.houseType || 'APARTMENT',
            priceType: data.priceType || 'JEONSE',
            maxDeposit: data.maxDeposit || 0,
            maxRent: data.maxRent || 0,
            school: '',
            additionalCondition: data.additionalCondition || '',
            phoneNumber: data.phoneNumber || '',
            isNear: data.isNear || 'n',
            airconYn: data.airconYn || 'n',
            washerYn: data.washerYn || 'n',
            fridgeYn: data.fridgeYn || 'n',
            useaprYear: data.useaprYear || 0,
          });

          // 전화번호가 있으면 userPhone에 설정
          if (data.phoneNumber) {
            setUserPhone(data.phoneNumber);
          }
        }
      } catch (err: any) {
        setError(err?.message ?? "의뢰서를 불러오지 못했습니다.");
      } finally {
        setDataLoading(false);
      }
    })();
  }, [isReady, isAuthenticated, requestId, router]);

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setDong(''); // 구 변경 시 동 초기화
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPhoneError(null);

    if (!district.trim()) {
      setError('희망 지역(구)을 선택해주세요.');
      return;
    }

    if (form.maxDeposit <= 0) {
      setError('보증금을 입력해주세요.');
      return;
    }

    // 전화번호 필수 검증
    if (!form.phoneNumber || form.phoneNumber.trim() === '') {
      setPhoneError('전화번호는 필수로 작성해야 합니다.');
      const phoneInput = document.getElementById('phone-number-input');
      phoneInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      phoneInput?.focus();
      return;
    }

    // 노후도 필수 검증
    if (form.useaprYear === 0) {
      setError('건물 노후도를 선택해주세요.');
      return;
    }

    // "구 동" 형식으로 조합 (동이 없으면 구만)
    const preferredRegion = dong ? `${district} ${dong}` : district;

    try {
      setLoading(true);
      await updateFinderRequest(requestId, {
        finder_request_id: requestId,
        status: form.status,
        preferredRegion,
        houseType: form.houseType,
        priceType: form.priceType,
        maxDeposit: form.maxDeposit,
        maxRent: form.maxRent,
        additionalCondition: form.additionalCondition || undefined,
        phoneNumber: form.phoneNumber,
        isNear: form.isNear,
        airconYn: form.airconYn,
        washerYn: form.washerYn,
        fridgeYn: form.fridgeYn,
        useaprYear: form.useaprYear,
      });

      alert('의뢰서가 성공적으로 수정되었습니다.');
      router.push(`/finder/request/${requestId}`);
    } catch (err: any) {
      setError(err?.message ?? '의뢰서 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <main className="space-y-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-600">의뢰서를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-slate-100">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-sky-700">의뢰서 수정</p>
          <h2 className="text-3xl font-bold text-slate-900">
            의뢰서 #{requestId} 수정
          </h2>
          <p className="text-sm text-slate-600">
            수정하고 싶은 매물 조건을 입력하세요.
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
            {/* 활성화/비활성화 토글 */}
            <div className="block space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span className="text-sm font-semibold text-slate-700">
                  의뢰서 상태
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: form.status === 'Y' ? 'N' : 'Y' })}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    form.status === 'Y' ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      form.status === 'Y' ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-semibold ${
                  form.status === 'Y' ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  {STATUS_LABEL[form.status]}
                </span>
              </div>
            </div>

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

            {/* 금액 정보 */}
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
            {/* 전화번호 */}
            <div className="space-y-4">
              <label className="block space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">📞</span>
                  <span className="text-sm font-semibold text-slate-700">전화번호</span>
                  <span className="text-xs text-red-500">*</span>
                </div>
                <input
                  id="phone-number-input"
                  type="tel"
                  className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
                    phoneError
                      ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
                      : userPhone
                      ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
                      : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                  }`}
                  value={form.phoneNumber}
                  onChange={(e) => {
                    if (!userPhone) {
                      setForm({ ...form, phoneNumber: e.target.value });
                      if (phoneError) setPhoneError(null);
                    }
                  }}
                  placeholder="예: 010-1234-5678"
                  disabled={!!userPhone}
                  readOnly={!!userPhone}
                />
                {phoneError && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                    <span>⚠️</span>
                    {phoneError}
                  </p>
                )}
                {userPhone && (
                  <p className="text-xs text-slate-500">
                    등록된 전화번호는 수정할 수 없습니다.
                  </p>
                )}
              </label>
            </div>

            {/* 학교 정보 - 구분선 */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2">
                <span className="text-base">🏫</span>
                <span className="text-sm font-semibold text-slate-700">학교 정보</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  학교명
                </span>
                <SchoolSearchInput
                  value={form.school}
                  onChange={(value) => setForm({ ...form, school: value })}
                  placeholder="학교명을 검색하세요 (예: 에방대학교 )"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer transition"
                    checked={form.isNear === 'y'}
                    onChange={(e) => setForm({ ...form, isNear: e.target.checked ? 'y' : 'n' })}
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900 transition">
                    학교가 가까웠으면 좋겠어요
                  </span>
                </label>
              </div>
            </div>

            {/* 가전제품 옵션 - 구분선 */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span className="text-sm font-semibold text-slate-700">가전제품 옵션</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer transition"
                      checked={form.airconYn === 'y'}
                      onChange={(e) => setForm({ ...form, airconYn: e.target.checked ? 'y' : 'n' })}
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition">
                      에어컨
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer transition"
                      checked={form.washerYn === 'y'}
                      onChange={(e) => setForm({ ...form, washerYn: e.target.checked ? 'y' : 'n' })}
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition">
                      세탁기
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer transition"
                      checked={form.fridgeYn === 'y'}
                      onChange={(e) => setForm({ ...form, fridgeYn: e.target.checked ? 'y' : 'n' })}
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition">
                      냉장고
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 건물 노후도 - 구분선 */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <label className="block space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏗️</span>
                  <span className="text-sm font-semibold text-slate-700">건물 노후도</span>
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
                  value={form.useaprYear}
                  onChange={(e) => setForm({ ...form, useaprYear: Number(e.target.value) })}
                  required
                >
                  <option value="0">선택해주세요</option>
                  <option value="1">5년 이하</option>
                  <option value="2">5~9년</option>
                  <option value="3">10~19년</option>
                  <option value="4">20~29년</option>
                  <option value="5">30년 이상</option>
                </select>
              </label>
            </div>

            {/* 추가 조건 - 구분선 */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
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
        </div>

        {/* 하단 버튼 - 오른쪽 정렬 */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/finder/request/${requestId}`)}
            className="rounded-xl px-6 py-3 text-base"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl px-8 py-3 text-base"
          >
            {loading ? '수정 중...' : '의뢰서 수정'}
          </Button>
        </div>
      </form>
    </main>
  );
}
