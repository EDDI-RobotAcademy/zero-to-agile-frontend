"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { getMyHousePlatforms, deleteHousePlatform } from '@/lib/repositories/ownerRepository';
import { HousePlatform } from '@/types/owner';

export default function OwnerListingsPage() {
  const router = useRouter();
  const [houses, setHouses] = useState<HousePlatform[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        setLoading(true);
        const data = await getMyHousePlatforms();
        setHouses(data);
      } catch (error) {
        console.error('매물 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('정말 이 매물을 삭제하시겠습니까?')) return;

    try {
      await deleteHousePlatform(id);
      setHouses(houses.filter(h => h.housePlatformId !== id));
      alert('매물이 삭제되었습니다.');
    } catch (error) {
      console.error('매물 삭제 실패:', error);
      alert('매물 삭제에 실패했습니다.');
    }
  };

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 via-white to-green-50 p-8 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-emerald-700">매물 관리</p>
            <h2 className="text-3xl font-bold text-slate-900">
              내 매물 목록
            </h2>
            <p className="text-sm text-slate-600">
              등록한 매물을 확인하고 관리하세요.
            </p>
          </div>
          <Button
            onClick={() => router.push('/owner/listings/new')}
            className="rounded-xl px-6 py-3 text-base"
          >
            + 매물 등록
          </Button>
        </div>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">매물을 불러오는 중...</p>
        </div>
      )}

      {/* 매물 목록 */}
      {!loading && houses.length === 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">등록된 매물이 없습니다.</p>
          <Button
            onClick={() => router.push('/owner/listings/new')}
            className="mt-4 rounded-xl px-6 py-3"
          >
            첫 매물 등록하기
          </Button>
        </div>
      )}

      {!loading && houses.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {houses.map((house) => (
            <div
              key={house.housePlatformId}
              onClick={() => router.push(`/owner/listings/${house.housePlatformId}`)}
              className="cursor-pointer overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 transition hover:shadow-xl"
            >
              {/* 카드 헤더 */}
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏠</span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {house.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
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
              </div>

              {/* 카드 내용 */}
              <div className="space-y-4 p-6">
                {/* 주소 */}
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

                {/* 가격 정보 */}
                <div className="flex items-start gap-2">
                  <span className="text-base">💰</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">가격 정보</p>
                    <p className="text-sm text-slate-600">
                      보증금 {house.deposit.toLocaleString()}만원
                      {house.monthlyRent > 0 && ` · 월세 ${house.monthlyRent.toLocaleString()}만원`}
                    </p>
                    {house.manageCost > 0 && (
                      <p className="text-xs text-slate-500">
                        관리비 {house.manageCost.toLocaleString()}만원
                      </p>
                    )}
                  </div>
                </div>

                {/* 매물 정보 */}
                <div className="flex items-start gap-2">
                  <span className="text-base">🏢</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">매물 정보</p>
                    <p className="text-sm text-slate-600">
                      {house.residenceType} · {house.roomType}
                    </p>
                    <p className="text-xs text-slate-500">
                      전용 {house.exclusiveArea}㎡ · {house.floorNo}/{house.allFloors}층
                      {house.hasElevator && ' · 엘리베이터'}
                      {house.canPark && ' · 주차가능'}
                    </p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/owner/listings/${house.housePlatformId}/edit`);
                    }}
                    variant="secondary"
                    className="flex-1 rounded-xl px-4 py-2 text-sm"
                  >
                    수정
                  </Button>
                  <Button
                    onClick={(e) => handleDelete(house.housePlatformId, e)}
                    variant="secondary"
                    className="rounded-xl px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
