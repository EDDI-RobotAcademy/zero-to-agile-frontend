"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { AddressAutocompleteInput } from '@/components/common/AddressAutocompleteInput';
import { createHousePlatform } from '@/lib/repositories/ownerRepository';
import { SALES_TYPES, RESIDENCE_TYPES, ROOM_TYPES, HousePlatformFormState, SalesType, ResidenceType, RoomType } from '@/types/owner';
import { Building2, Car } from 'lucide-react';

export default function OwnerNewListingPage() {
  const router = useRouter();

  const [baseAddress, setBaseAddress] = useState<string>('');
  const [detailAddress, setDetailAddress] = useState<string>('');

  const [form, setForm] = useState<HousePlatformFormState>({
    title: '',
    domainId: 1,
    rgstNo: '',
    salesType: '월세' as const,
    deposit: 0,
    monthlyRent: 0,
    residenceType: '원룸' as const,
    roomType: '오픈형' as const,
    contractArea: 0,
    exclusiveArea: 0,
    floorNo: 0,
    allFloors: 0,
    manageCost: 0,
    canPark: false,
    hasElevator: false,
    pnuCd: '',
    snapshotId: '',
  });

  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError('매물 제목을 입력해주세요.');
      return;
    }

    if (!baseAddress.trim()) {
      setError('지역을 입력해주세요.');
      return;
    }

    if (!detailAddress.trim()) {
      setError('상세 주소를 입력해주세요.');
      return;
    }

    if (form.deposit <= 0) {
      setError('보증금을 입력해주세요.');
      return;
    }

    if (form.exclusiveArea <= 0) {
      setError('전용면적을 입력해주세요.');
      return;
    }

    // 주소 조합
    const fullAddress = `${baseAddress.trim()} ${detailAddress.trim()}`;

    // 구/동 추출 (마지막 두 단어)
    const addressParts = baseAddress.trim().split(' ');
    const guNm = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : '';
    const dongNm = addressParts.length >= 1 ? addressParts[addressParts.length - 1] : '';

    try {
      setLoading(true);
      // 빈 URL 제거
      const filteredImageUrls = imageUrls.filter(url => url.trim() !== '');

      await createHousePlatform({
        title: form.title,
        address: fullAddress,
        deposit: form.deposit,
        domainId: form.domainId,
        rgstNo: form.rgstNo || `REG-${Date.now()}`,
        salesType: form.salesType,
        monthlyRent: form.monthlyRent,
        roomType: form.roomType,
        contractArea: form.contractArea || form.exclusiveArea,
        exclusiveArea: form.exclusiveArea,
        floorNo: form.floorNo,
        allFloors: form.allFloors,
        latLng: {},
        manageCost: form.manageCost,
        canPark: form.canPark,
        hasElevator: form.hasElevator,
        imageUrls: JSON.stringify(filteredImageUrls),
        pnuCd: form.pnuCd || '',
        isBanned: false,
        residenceType: form.residenceType,
        guNm: guNm,
        dongNm: dongNm,
        snapshotId: form.snapshotId || `SNAP-${Date.now()}`,
      });
      alert('매물이 성공적으로 등록되었습니다.');
      router.push('/owner/listings');
    } catch (err: any) {
      setError(err?.message ?? '매물 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium tracking-tight text-blue-500 ml-0.5">
              매물 등록
            </p>
            <h2 className="text-[26px] font-semibold tracking-[-0.015em] mb-1 text-slate-900">
              새 매물 등록
            </h2>
            <p className="text-sm tracking-[-0.005em] leading-relaxed text-slate-500">
              보유하신 매물 정보를 입력하여 등록하세요.
            </p>
          </div>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 기본 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500">
                <span className="text-sm font-bold text-white">1</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">기본 정보</h3>
                <p className="text-xs text-slate-500">매물의 기본 정보를 입력하세요</p>
              </div>
            </div>
          </div>
          <div className="space-y-6 p-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                매물 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={form.residenceType}
                  onChange={(e) => setForm({ ...form, residenceType: e.target.value as ResidenceType })}
                  required
                >
                  {RESIDENCE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  거래 유형 <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={form.salesType}
                  onChange={(e) => setForm({ ...form, salesType: e.target.value as SalesType })}
                  required
                >
                  {SALES_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 to-sky-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500">
                <span className="text-sm font-bold text-white">2</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">가격 정보</h3>
                <p className="text-xs text-slate-500">보증금, 월세, 관리비를 입력하세요</p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                보증금 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
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
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
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
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  value={form.manageCost || ''}
                  onChange={(e) => setForm({ ...form, manageCost: Number(e.target.value) })}
                  placeholder="0"
                />
                <span className="text-sm font-medium text-slate-600">만원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 면적 및 층수 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
                <span className="text-sm font-bold text-white">3</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">면적 및 층수</h3>
                <p className="text-xs text-slate-500">매물의 면적과 위치 정보를 입력하세요</p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                전용면적 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
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
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
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
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
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
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
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
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 to-violet-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500">
                <span className="text-sm font-bold text-white">4</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">추가 정보</h3>
                <p className="text-xs text-slate-500">방 구조 및 편의시설을 선택하세요</p>
              </div>
            </div>
          </div>
          <div className="space-y-6 p-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                방 구조
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-100 sm:w-1/2"
                value={form.roomType}
                onChange={(e) => setForm({ ...form, roomType: e.target.value as RoomType })}
              >
                {ROOM_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                편의시설
              </label>
              <div className="flex flex-wrap gap-3">
                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border-2 border-slate-200 bg-white px-4 py-2.5 transition hover:border-violet-300 hover:bg-violet-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 transition focus:ring-2 focus:ring-violet-200"
                    checked={form.hasElevator}
                    onChange={(e) => setForm({ ...form, hasElevator: e.target.checked })}
                  />
                  <Building2 className="h-4 w-4 text-violet-400 " />
                  <span className="text-sm font-medium text-slate-700">엘리베이터</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border-2 border-slate-200 bg-white px-4 py-2.5 transition hover:border-violet-300 hover:bg-violet-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 transition focus:ring-2 focus:ring-violet-200"
                    checked={form.canPark}
                    onChange={(e) => setForm({ ...form, canPark: e.target.checked })}
                  />
                  <Car className="h-4 w-4 text-violet-400"/>
                  <span className="text-sm font-medium text-slate-700">주차 가능</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 이미지 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500">
                <span className="text-sm font-bold text-white">5</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">이미지</h3>
                <p className="text-xs text-slate-500">매물 이미지 URL을 추가하세요</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">이미지 URL 목록</label>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="flex items-center gap-1.5 rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
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
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
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

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/owner/listings')}
            disabled={loading}
            className="rounded-lg px-6 py-2.5"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-lg px-8 py-2.5"
          >
            {loading ? '등록 중...' : '매물 등록'}
          </Button>
        </div>
      </form>
    </main>
  );
}
