"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { getHousePlatformById, updateHousePlatform } from '@/lib/repositories/ownerRepository';
import { AddressAutocompleteInput } from '@/components/common/AddressAutocompleteInput';
import { SALES_TYPES, RESIDENCE_TYPES, ROOM_TYPES, HousePlatformEditFormState } from '@/types/owner';

type PageProps = { params: Promise<{ id: string }> };

export default function OwnerEditListingPage({ params }: PageProps) {
  const router = useRouter();

  const [housePlatformId, setHousePlatformId] = useState<number | null>(null);
  const [baseAddress, setBaseAddress] = useState<string>('');
  const [detailAddress, setDetailAddress] = useState<string>('');

  const [form, setForm] = useState<HousePlatformEditFormState>({
    title: '',
    salesType: '월세',
    deposit: 0,
    monthlyRent: 0,
    residenceType: '원룸',
    roomType: '오픈형',
    contractArea: 0,
    exclusiveArea: 0,
    floorNo: 0,
    allFloors: 0,
    manageCost: 0,
    canPark: false,
    hasElevator: false,
  });

  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAddImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleRemoveImageUrl = (index: number) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  useEffect(() => {
    let active = true;
    Promise.resolve(params).then(async ({ id }) => {
      if (!active) return;
      const numId = Number(id);
      setHousePlatformId(numId);

      try {
        setDataLoading(true);
        const data = await getHousePlatformById(numId);
        if (!active) return;
        if (!data) {
          setError('매물을 찾을 수 없습니다.');
          return;
        }

        // 주소 파싱
        const addressParts = data.address.trim().split(' ');
        // baseAddress는 구와 동으로 구성
        const guPart = data.guNm || addressParts[0] || '';
        const dongPart = data.dongNm || (addressParts.length > 1 ? addressParts[1] : '');
        setBaseAddress(dongPart ? `${guPart} ${dongPart}` : guPart);

        // detailAddress는 나머지 부분
        const startIndex = (data.guNm && data.dongNm) ? 2 : 1;
        setDetailAddress(addressParts.slice(startIndex).join(' '));

        // 폼 초기화
        setForm({
          title: data.title,
          salesType: data.salesType,
          deposit: data.deposit,
          monthlyRent: data.monthlyRent,
          residenceType: data.residenceType,
          roomType: data.roomType,
          contractArea: data.contractArea,
          exclusiveArea: data.exclusiveArea,
          floorNo: data.floorNo,
          allFloors: data.allFloors,
          manageCost: data.manageCost,
          canPark: data.canPark,
          hasElevator: data.hasElevator,
        });

        // 이미지 URL 파싱
        try {
          const parsedUrls = data.imageUrls ? JSON.parse(data.imageUrls) : [];
          setImageUrls(Array.isArray(parsedUrls) && parsedUrls.length > 0 ? parsedUrls : ['']);
        } catch {
          setImageUrls(data.imageUrls ? [data.imageUrls] : ['']);
        }
      } catch (err: any) {
        if (active) setError(err?.message ?? '매물을 불러오지 못했습니다.');
      } finally {
        if (active) setDataLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [params]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!housePlatformId) return;
    setError(null);

    const fullAddress = `${baseAddress.trim()} ${detailAddress.trim()}`;

    // baseAddress에서 구/동 추출
    const addressParts = baseAddress.trim().split(' ');
    const guNm = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : '';
    const dongNm = addressParts.length >= 1 ? addressParts[addressParts.length - 1] : '';

    try {
      setLoading(true);
      // 빈 URL 제거
      const filteredImageUrls = imageUrls.filter(url => url.trim() !== '');

      await updateHousePlatform(housePlatformId, {
        title: form.title,
        address: fullAddress,
        deposit: form.deposit,
        salesType: form.salesType,
        monthlyRent: form.monthlyRent,
        roomType: form.roomType,
        contractArea: form.contractArea,
        exclusiveArea: form.exclusiveArea,
        floorNo: form.floorNo,
        allFloors: form.allFloors,
        manageCost: form.manageCost,
        canPark: form.canPark,
        hasElevator: form.hasElevator,
        imageUrls: JSON.stringify(filteredImageUrls),
        residenceType: form.residenceType,
        guNm,
        dongNm,
      });
      alert('매물이 수정되었습니다.');
      router.push('/owner/listings');
    } catch (err: any) {
      setError(err?.message ?? '매물 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <main className="space-y-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">매물을 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className="space-y-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={() => router.push('/owner/listings')} className="mt-4">
            목록으로
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 via-white to-green-50 p-8 shadow-sm ring-1 ring-slate-100">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-emerald-700">매물 수정</p>
          <h2 className="text-3xl font-bold text-slate-900">
            매물 정보 수정
          </h2>
          <p className="text-sm text-slate-600">
            등록된 매물 정보를 수정하세요.
          </p>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-900">기본 정보</h3>
            <p className="mt-1 text-xs text-slate-600">매물의 기본 정보를 수정하세요</p>
          </div>
          <div className="space-y-6 p-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                매물 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="예) 마포구 신축 원룸, 풀옵션"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                주소 (지역) <span className="text-red-500">*</span>
              </label>
              <AddressAutocompleteInput
                value={baseAddress}
                onChange={setBaseAddress}
                placeholder="지역을 입력하세요 (예: 서울, 마포구, 상수동)"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                상세 주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                placeholder="예) 00아파트 000동 000호"
                required
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  매물 유형 <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={form.residenceType}
                  onChange={(e) => setForm({ ...form, residenceType: e.target.value })}
                >
                  {RESIDENCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  거래 유형 <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={form.salesType}
                  onChange={(e) => setForm({ ...form, salesType: e.target.value })}
                >
                  {SALES_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-900">가격 정보</h3>
            <p className="mt-1 text-xs text-slate-600">보증금, 월세, 관리비를 입력하세요</p>
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                보증금 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={form.deposit || ''}
                  onChange={(e) => setForm({ ...form, deposit: Number(e.target.value) })}
                  placeholder="0"
                  required
                />
                <span className="text-sm font-medium text-slate-600">만원</span>
              </div>
            </div>

            {form.salesType === '월세' && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  월세
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    value={form.monthlyRent || ''}
                    onChange={(e) => setForm({ ...form, monthlyRent: Number(e.target.value) })}
                    placeholder="0"
                  />
                  <span className="text-sm font-medium text-slate-600">만원</span>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                관리비
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={form.manageCost || ''}
                  onChange={(e) => setForm({ ...form, manageCost: Number(e.target.value) })}
                  placeholder="0"
                />
                <span className="text-sm font-medium text-slate-600">원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 면적 및 층수 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-900">면적 및 층수</h3>
            <p className="mt-1 text-xs text-slate-600">매물의 면적과 위치 정보를 입력하세요</p>
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                전용면적 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={form.exclusiveArea || ''}
                  onChange={(e) => setForm({ ...form, exclusiveArea: Number(e.target.value) })}
                  placeholder="0"
                  required
                />
                <span className="text-sm font-medium text-slate-600">㎡</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                계약면적
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={form.contractArea || ''}
                  onChange={(e) => setForm({ ...form, contractArea: Number(e.target.value) })}
                  placeholder="0"
                />
                <span className="text-sm font-medium text-slate-600">㎡</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                해당 층수
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={form.floorNo || ''}
                  onChange={(e) => setForm({ ...form, floorNo: Number(e.target.value) })}
                  placeholder="0"
                />
                <span className="text-sm font-medium text-slate-600">층</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                건물 전체 층수
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={form.allFloors || ''}
                  onChange={(e) => setForm({ ...form, allFloors: Number(e.target.value) })}
                  placeholder="0"
                />
                <span className="text-sm font-medium text-slate-600">층</span>
              </div>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-900">추가 정보</h3>
            <p className="mt-1 text-xs text-slate-600">방 구조 및 편의시설을 선택하세요</p>
          </div>
          <div className="space-y-6 p-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                방 구조
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:w-1/2"
                value={form.roomType}
                onChange={(e) => setForm({ ...form, roomType: e.target.value })}
              >
                {ROOM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                편의시설
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-3 transition hover:border-emerald-300 hover:bg-emerald-50">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300 text-emerald-600 transition focus:ring-2 focus:ring-emerald-200"
                    checked={form.hasElevator}
                    onChange={(e) => setForm({ ...form, hasElevator: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-slate-700">엘리베이터</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-3 transition hover:border-emerald-300 hover:bg-emerald-50">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300 text-emerald-600 transition focus:ring-2 focus:ring-emerald-200"
                    checked={form.canPark}
                    onChange={(e) => setForm({ ...form, canPark: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-slate-700">주차 가능</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 이미지 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-900">이미지</h3>
            <p className="mt-1 text-xs text-slate-600">매물 이미지 URL을 추가하세요</p>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">이미지 URL 목록</label>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                <span>+</span>
                <span>URL 추가</span>
              </button>
            </div>
            <div className="space-y-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-600">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(index)}
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border-2 border-red-200 bg-red-50 text-xl text-red-600 transition hover:border-red-300 hover:bg-red-100"
                      title="삭제"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {imageUrls.length === 0 && (
              <p className="text-center text-sm text-slate-400">이미지 URL을 추가해주세요</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.push('/owner/listings')} disabled={loading}>
            취소
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '수정 중...' : '변경사항 저장'}
          </Button>
        </div>
      </form>
    </main>
  );
}
