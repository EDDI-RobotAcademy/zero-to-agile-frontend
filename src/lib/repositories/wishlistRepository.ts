import { WishlistItem } from '@/types/wishlist';
import { userStore } from '../auth/userStore';
import { USE_MOCK } from '@/config/env';
import { wishlistMock } from '@/mocks/finder/wishlist.mock';

const BASE_PATH = '/finder/wishlist';

// Mock 데이터 저장소
let mockWishlist: WishlistItem[] = [...wishlistMock];

/**
 * 위시리스트에 매물 추가
 */
export async function addToWishlist(housePlatformId: number): Promise<void> {
  // Mock 모드
  if (USE_MOCK) {
    const newItem: WishlistItem = {
      wishlistId: Date.now(),
      housePlatformId,
      houseTitle: `매물 #${housePlatformId}`,
      address: '서울시 강남구',
      salesType: '전세',
      deposit: 50000000,
      roomType: '아파트',
      createdAt: new Date().toISOString(),
    };
    mockWishlist.push(newItem);
    return;
  }

  // 실제 API 호출
  try {
    const res = await userStore.authFetch(BASE_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ house_platform_id: housePlatformId }),
    });

    if (res.status === 401) throw new Error('UNAUTHENTICATED');
    if (!res.ok) throw new Error('Failed to add to wishlist');
  } catch (err) {
    console.error('addToWishlist failed', err);
    throw err instanceof Error ? err : new Error('Failed to add to wishlist');
  }
}

/**
 * 위시리스트 목록 조회
 */
export async function listWishlist(): Promise<WishlistItem[]> {
  // Mock 모드
  if (USE_MOCK) {
    return mockWishlist;
  }

  // 실제 API 호출
  try {
    const res = await userStore.authFetch(BASE_PATH, {
      method: 'GET',
    });

    if (res.status === 401) throw new Error('UNAUTHENTICATED');
    if (!res.ok) throw new Error('Failed to fetch wishlist');

    const data = await res.json();
    return data.items ?? [];
  } catch (err) {
    console.error('listWishlist failed', err);
    throw err instanceof Error ? err : new Error('Failed to fetch wishlist');
  }
}

/**
 * 위시리스트에서 제거
 */
export async function removeFromWishlist(wishlistId: number): Promise<void> {
  // Mock 모드
  if (USE_MOCK) {
    mockWishlist = mockWishlist.filter(item => item.wishlistId !== wishlistId);
    return;
  }

  // 실제 API 호출
  try {
    const res = await userStore.authFetch(`${BASE_PATH}/${wishlistId}`, {
      method: 'DELETE',
    });

    if (res.status === 401) throw new Error('UNAUTHENTICATED');
    if (!res.ok) throw new Error('Failed to remove from wishlist');
  } catch (err) {
    console.error('removeFromWishlist failed', err);
    throw err instanceof Error ? err : new Error('Failed to remove from wishlist');
  }
}
