"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { getHousePlatformById, deleteHousePlatform } from '@/lib/repositories/ownerRepository';
import { HousePlatform } from '@/types/owner';
import { ImageGallery } from '@/components/common/ImageGallery';

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
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 via-white to-green-50 p-8 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-emerald-700">매물 상세</p>
            <h2 className="text-3xl font-bold text-slate-900">{house.title}</h2>
            <div className="flex gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {house.salesType}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  house.isBanned
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {house.isBanned ? '차단됨' : '활성'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/owner/listings/${housePlatformId}/edit`)}
              className="rounded-xl px-6 py-3 text-base"
            >
              수정
            </Button>
            <Button
              onClick={handleDelete}
              variant="secondary"
              className="rounded-xl px-6 py-3 text-base text-red-600 hover:bg-red-50"
            >
              삭제
            </Button>
          </div>
        </div>
      </div>

      {/* 이미지 갤러리 */}
      {imageUrlsArray.length > 0 && (
        <ImageGallery images={imageUrlsArray} alt={house.title} />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* 기본 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h3 className="text-lg font-bold text-slate-900">기본 정보</h3>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex items-start gap-2">
              <span className="text-base">📍</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">주소</p>
                <p className="text-sm text-slate-600">{house.address}</p>
                <p className="text-xs text-slate-500">
                  {house.guNm} {house.dongNm}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-base">🏢</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">매물 유형</p>
                <p className="text-sm text-slate-600">
                  {house.residenceType}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-base">🚪</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">방 구조</p>
                <p className="text-sm text-slate-600">
                  {house.roomType}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-base">📄</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">등록번호</p>
                <p className="text-sm text-slate-600">{house.rgstNo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 금액 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <h3 className="text-lg font-bold text-slate-900">금액 정보</h3>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex items-start gap-2">
              <span className="text-base">💵</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">보증금</p>
                <p className="text-xl font-bold text-blue-900">
                  {house.deposit.toLocaleString()}만원
                </p>
              </div>
            </div>

            {house.monthlyRent > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-base">💳</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">월세</p>
                  <p className="text-xl font-bold text-blue-900">
                    {house.monthlyRent.toLocaleString()}만원
                  </p>
                </div>
              </div>
            )}

            {house.manageCost > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-base">🔧</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">관리비</p>
                  <p className="text-sm text-slate-600">
                    {house.manageCost.toLocaleString()}만원
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📏</span>
              <h3 className="text-lg font-bold text-slate-900">면적 및 층수</h3>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex items-start gap-2">
              <span className="text-base">📐</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">전용면적</p>
                <p className="text-sm text-slate-600">{house.exclusiveArea}㎡</p>
              </div>
            </div>

            {house.contractArea > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-base">📐</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">계약면적</p>
                  <p className="text-sm text-slate-600">{house.contractArea}㎡</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <span className="text-base">🏗️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">층수</p>
                <p className="text-sm text-slate-600">
                  {house.floorNo}층 / 전체 {house.allFloors}층
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 편의시설 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <h3 className="text-lg font-bold text-slate-900">편의시설</h3>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`text-xl ${house.hasElevator ? '' : 'opacity-30'}`}>
                  🏢
                </span>
                <span className={`text-sm ${house.hasElevator ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  엘리베이터
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xl ${house.canPark ? '' : 'opacity-30'}`}>
                  🚗
                </span>
                <span className={`text-sm ${house.canPark ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  주차 가능
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() => router.push('/owner/listings')}
          className="rounded-xl px-6 py-3 text-base"
        >
          목록으로
        </Button>
      </div>
    </main>
  );
}
