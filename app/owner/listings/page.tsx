"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { getMyHousePlatforms, deleteHousePlatform } from '@/lib/repositories/ownerRepository';
import { HousePlatform } from '@/types/owner';
import {
  Home,
  MapPin,
  Wallet,
  Building2,
  Pencil,
  Trash2,
} from 'lucide-react';
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
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium tracking-tight text-blue-500 ml-0.5">
              매물 관리
            </p>
            <h2 className="text-[26px] font-semibold tracking-[-0.015em] mb-1 text-slate-900">
              내 매물 목록
            </h2>
            <p className="text-sm tracking-[-0.005em] leading-relaxed text-slate-500">
              등록한 매물을 확인하고 관리하세요.
            </p>
          </div>
          <Button
            onClick={() => router.push('/owner/listings/new')}
            className="
              rounded-xl
              px-5
              py-2.5
              text-sm
              font-medium
              tracking-tight
              bg-blue-600
              text-white
              shadow-sm
              hover:bg-blue-700
              hover:shadow-md
              active:scale-[0.98]
              transition
            "
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
              className="
                group
                flex
                cursor-pointer
                flex-col
                overflow-hidden
                rounded-3xl
                bg-white
                ring-1
                ring-slate-200
                transition
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              {/* 카드 헤더 */}
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
                    {house.title}
                  </h3>

                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[12px] font-medium text-blue-600">
                      {house.salesType}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${house.isBanned
                          ? 'bg-red-50 text-red-600'
                          : 'bg-blue-50 text-blue-600'
                        }`}
                    >
                      {house.isBanned ? '차단' : '활성'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 카드 내용 */}
              <div className="flex flex-1 flex-col gap-5 p-6">
                {/* 주소 */}
                <div className="flex items-start gap-2">
                  <MapPin className="mt-[2px] h-4 w-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-slate-400">주소</p>
                    <p className="mt-1 text-[14px] leading-[1.5] text-slate-700">
                      {house.address}
                    </p>
                  </div>
                </div>

                {/* 가격 정보 */}
                <div className="flex items-start gap-2">
                  <Wallet className="mt-[2px] h-4 w-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-slate-400">가격 정보</p>
                    <p className="mt-1 text-[14px] leading-[1.5] text-slate-700">
                      보증금 {house.deposit.toLocaleString()}만원
                      {house.monthlyRent > 0 &&
                        ` · 월세 ${house.monthlyRent.toLocaleString()}만원`}
                    </p>
                    {house.manageCost > 0 && (
                      <p className="mt-1 text-[13px] leading-[1.45] text-slate-500">
                        관리비 {house.manageCost.toLocaleString()}만원
                      </p>
                    )}
                  </div>
                </div>

                {/* 매물 정보 */}
                <div className="flex items-start gap-2">
                  <Building2 className="mt-[2px] h-4 w-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-slate-400">매물 정보</p>
                    <p className="mt-1 text-[14px] leading-[1.5] text-slate-700">
                      {house.residenceType} · {house.roomType}
                    </p>
                    <p className="mt-1 text-[13px] leading-[1.45] text-slate-500">
                      전용 {house.exclusiveArea}㎡ · {house.floorNo}/{house.allFloors}층
                      {house.hasElevator && ' · 엘리베이터'}
                      {house.canPark && ' · 주차가능'}
                    </p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="mt-auto flex justify-end gap-5 pt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/owner/listings/${house.housePlatformId}/edit`);
                    }}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-slate-400 transition hover:text-blue-600"
                  >
                    <Pencil className="h-4 w-4" />
                    수정
                  </button>

                  <button
                    onClick={(e) => handleDelete(house.housePlatformId, e)}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-slate-300 transition hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
