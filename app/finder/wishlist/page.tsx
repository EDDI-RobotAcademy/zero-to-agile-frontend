"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listWishlist, removeFromWishlist } from '@/lib/repositories/wishlistRepository';
import { WishlistItem } from '@/types/wishlist';
import { Button } from '@/components/common/Button';

const ROOM_TYPE_LABEL: Record<string, string> = {
  '아파트': '아파트',
  '오피스텔': '오피스텔',
  '빌라': '빌라',
  '단독주택': '단독주택',
  '상가': '상가',
};

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await listWishlist();
      setWishlist(items);
    } catch (err: any) {
      if (err?.message === 'UNAUTHENTICATED') {
        router.replace('/auth/role-select');
        return;
      }
      setError(err?.message ?? '위시리스트를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // API 준비 전 임시 주석 처리
  // useEffect(() => {
  //   fetchWishlist();
  // }, []);

  const handleRemove = async (wishlistId: number) => {
    if (!confirm('이 매물을 위시리스트에서 삭제하시겠습니까?')) return;

    try {
      await removeFromWishlist(wishlistId);
      await fetchWishlist();
    } catch (err: any) {
      alert(err?.message ?? '삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-slate-600">위시리스트를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-pink-100 via-white to-purple-50 p-8 shadow-sm ring-1 ring-slate-100">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-pink-700">내가 찜한</p>
          <h2 className="text-3xl font-bold text-slate-900">위시리스트</h2>
          <p className="text-sm text-slate-600">
            관심있는 매물을 모아서 비교하고 관리하세요
          </p>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 위시리스트 비어있음 */}
      {!error && wishlist.length === 0 && (
        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl bg-slate-50 p-12">
          <div className="text-center">
            <p className="text-5xl">💙</p>
            <p className="mt-4 text-lg font-semibold text-slate-700">아직 찜한 매물이 없어요</p>
            <p className="mt-2 text-sm text-slate-500">
              추천 매물을 둘러보고 마음에 드는 매물을 저장해보세요
            </p>
          </div>
        </div>
      )}

      {/* 위시리스트 */}
      <div className="space-y-4">
        {wishlist.map((item) => (
          <div
            key={item.wishlistId}
            className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 transition hover:shadow-2xl"
          >
            <div className="grid gap-6 p-6 md:grid-cols-[200px,1fr,auto]">
              {/* 이미지 */}
              <div className="h-40 w-full overflow-hidden rounded-2xl shadow-md md:h-full md:w-48">
                <img
                  src={item.imageUrl || 'https://picsum.photos/seed/wishlist/600/400'}
                  alt={item.houseTitle}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://picsum.photos/seed/wishlist/600/400';
                  }}
                />
              </div>

              {/* 정보 */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{item.houseTitle}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                    <span>📍</span>
                    {item.address}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                    {item.salesType}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {ROOM_TYPE_LABEL[item.roomType] || item.roomType}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-600">보증금</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {item.deposit.toLocaleString()}
                  </span>
                  <span className="text-lg font-semibold text-slate-900">원</span>
                  {item.monthlyRent && (
                    <>
                      <span className="text-sm text-slate-400">·</span>
                      <span className="text-sm font-semibold text-slate-600">월세</span>
                      <span className="text-lg font-bold text-blue-700">
                        {item.monthlyRent.toLocaleString()}원
                      </span>
                    </>
                  )}
                </div>

                {(item.area || item.floor) && (
                  <div className="flex gap-4 text-sm text-slate-600">
                    {item.area && (
                      <span>
                        📐 {item.area}m²
                      </span>
                    )}
                    {item.floor && (
                      <span>
                        🏢 {item.floor}층
                      </span>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-400">
                  찜한 날짜: {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>

              {/* 액션 버튼 */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  className="rounded-xl px-4 py-2"
                  onClick={() => alert('상세보기 기능은 준비중입니다.')}
                >
                  상세보기
                </Button>
                <Button
                  variant="secondary"
                  className="rounded-xl bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100"
                  onClick={() => handleRemove(item.wishlistId)}
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
