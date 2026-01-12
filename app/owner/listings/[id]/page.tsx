"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { getHousePlatformById, deleteHousePlatform } from '@/lib/repositories/ownerRepository';
import { HousePlatform } from '@/types/owner';
import { ImageGallery } from '@/components/common/ImageGallery';
import {
  FileText,
  MapPin,
  Building2,
  Home,
  Wallet,
  DollarSign,
  CreditCard,
  Wrench,
  Ruler,
  Square,
  Building,
  Sparkles,
  Car,
  Pencil,
  Trash2,
  ArrowLeft,
} from 'lucide-react';

type PageProps = { params: Promise<{ id: string }> };

export default function OwnerListingDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [housePlatformId, setHousePlatformId] = useState<number | null>(null);
  const [house, setHouse] = useState<HousePlatform | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.resolve(params).then(async ({ id }) => {
      if (!active) return;
      const numId = Number(id);
      setHousePlatformId(numId);

      try {
        setLoading(true);
        const data = await getHousePlatformById(numId);
        if (!active) return;
        if (!data) {
          setError('매물을 찾을 수 없습니다.');
          return;
        }
        setHouse(data);
      } catch (err: any) {
        if (active) {
          setError(err?.message ?? '매물 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [params]);

  const handleDelete = async () => {
    if (!housePlatformId) return;
    if (!confirm('정말 이 매물을 삭제하시겠습니까?')) return;

    try {
      await deleteHousePlatform(housePlatformId);
      alert('매물이 삭제되었습니다.');
      router.push('/owner/listings');
    } catch (error) {
      console.error('매물 삭제 실패:', error);
      alert('매물 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">매물 정보를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error || !house) {
    return (
      <main className="space-y-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="text-sm text-red-600">{error || '매물을 찾을 수 없습니다.'}</p>
          <Button
            onClick={() => router.push('/owner/listings')}
            className="mt-4 rounded-xl px-6 py-3"
          >
            목록으로 돌아가기
          </Button>
        </div>
      </main>
    );
  }

  // 이미지 URL 파싱
  let imageUrlsArray: string[] = [];
  try {
    if (house.imageUrls && house.imageUrls.trim()) {
      const parsed = JSON.parse(house.imageUrls);
      imageUrlsArray = Array.isArray(parsed) ? parsed.filter(url => url && url.trim()) : [];
    }
  } catch {
    // JSON 파싱 실패 시 단일 URL로 처리
    if (house.imageUrls && house.imageUrls.trim()) {
      imageUrlsArray = [house.imageUrls];
    }
  }

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium tracking-tight text-blue-500  ml-0.5">매물 상세</p>
            <h2 className="mb-1.5 text-[26px] font-semibold tracking-[-0.015em] text-slate-900">{house.title}</h2>
            <div className="flex gap-1.5">
              <span className="rounded-full bg-blue-50 px-0.5 py-0.5 text-[12px] font-medium text-blue-600">
                {house.salesType}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                  house.isBanned
                    ? 'bg-red-50 text-red-600'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                {house.isBanned ? '차단' : '활성'}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/owner/listings/${housePlatformId}/edit`)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium tracking-tight text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
            >
              <Pencil className="h-3.5 w-3.5" />
              수정
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium tracking-tight text-slate-500 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              삭제
            </button>
          </div>
        </div>
      </div>

      {/* 이미지 갤러리 */}
      {imageUrlsArray.length > 0 && (
        <ImageGallery images={imageUrlsArray} alt={house.title} />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* 기본 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <h3 className="text-base font-semibold tracking-tight text-slate-900">기본 정보</h3>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-start gap-2">
              <MapPin className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">주소</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{house.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">매물 유형</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">
                  {house.residenceType}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Home className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">방 구조</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">
                  {house.roomType}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FileText className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">등록번호</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{house.rgstNo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 금액 정보 */}
<div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
  {/* 헤더 */}
  <div className="border-b border-slate-100 bg-white px-6 py-4">
    <div className="flex items-center gap-2">
      <Wallet className="h-4 w-4 text-blue-400" />
      <h3 className="text-base font-semibold tracking-tight text-slate-900">
        금액 정보
      </h3>
    </div>
  </div>

  {/* 내용 */}
  <div className="flex flex-col gap-4 p-6">
    {/* 보증금 */}
    <div className="flex items-start gap-2">
      <DollarSign className="mt-[2px] h-4 w-4 text-blue-400" />
      <div className="flex-1">
        <p className="text-[12px] font-medium text-slate-400">보증금</p>
        <p className="mt-0.5 text-[18px] font-semibold tracking-tight text-slate-900">
          <span className="relative inline-block bg-gradient-to-t from-blue-200/70 to-blue-200/30 px-1 rounded-sm">
            {house.deposit.toLocaleString()}만원
          </span>
        </p>
      </div>
    </div>

    {/* 월세 */}
    {house.monthlyRent > 0 && (
      <div className="flex items-start gap-2">
        <CreditCard className="mt-[2px] h-4 w-4 text-blue-400" />
        <div className="flex-1">
          <p className="text-[12px] font-medium text-slate-400">월세</p>
          <p className="mt-0.5 text-[18px] font-semibold tracking-tight text-slate-900">
            <span className="relative inline-block bg-gradient-to-t from-blue-200/70 to-blue-200/30 px-1 rounded-sm">
              {house.monthlyRent.toLocaleString()}만원
            </span>
          </p>
        </div>
      </div>
    )}

    {/* 관리비 */}
    {house.manageCost > 0 && (
      <div className="flex items-start gap-2">
        <Wrench className="mt-[2px] h-4 w-4 text-blue-400" />
        <div className="flex-1">
          <p className="text-[12px] font-medium text-slate-400">관리비</p>
          <p className="mt-0.5 text-[18px] font-semibold tracking-tight text-slate-900">
            <span className="relative inline-block bg-gradient-to-t from-blue-200/70 to-blue-200/30 px-1 rounded-sm">
              {house.manageCost.toLocaleString()}만원
            </span>
          </p>
        </div>
      </div>
    )}
  </div>
</div>


        {/* 상세 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-blue-400" />
              <h3 className="text-base font-semibold tracking-tight text-slate-900">면적 및 층수</h3>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-start gap-2">
              <Square className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">전용면적</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{house.exclusiveArea}㎡</p>
              </div>
            </div>

            {house.contractArea > 0 && (
              <div className="flex items-start gap-2">
                <Square className="mt-[2px] h-4 w-4 text-blue-400" />
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-slate-400">계약면적</p>
                  <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">{house.contractArea}㎡</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Building className="mt-[2px] h-4 w-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-slate-400">층수</p>
                <p className="mt-0.5 text-[14px] leading-[1.4] text-slate-700">
                  {house.floorNo}층 / 전체 {house.allFloors}층
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 편의시설 */}
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <h3 className="text-base font-semibold tracking-tight text-slate-900">편의시설</h3>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Building2 className={`h-4 w-4 ${house.hasElevator ? 'text-blue-400' : 'text-slate-300'}`} />
                <span className={`text-[14px] ${house.hasElevator ? 'font-medium text-slate-700' : 'text-slate-400'}`}>
                  엘리베이터
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Car className={`h-4 w-4 ${house.canPark ? 'text-blue-400' : 'text-slate-300'}`} />
                <span className={`text-[14px] ${house.canPark ? 'font-medium text-slate-700' : 'text-slate-400'}`}>
                  주차 가능
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push('/owner/listings')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium tracking-tight text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          목록으로
        </button>
      </div>
    </main>
  );
}
