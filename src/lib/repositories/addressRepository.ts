import { USE_MOCK } from '@/config/env';
import { userStore } from '@/lib/auth/userStore';

/**
 * 주소 자동완성 검색
 * GET /autocomplete?q={prefix}
 */
export async function searchAddresses(prefix: string): Promise<string[]> {
  if (USE_MOCK) {
    // 목 데이터: 간단한 필터링
    const mockAddresses = [
      '서울특별시 마포구 상수동',
      '서울특별시 마포구 서교동',
      '서울특별시 마포구 합정동',
      '서울특별시 마포구 연남동',
      '서울특별시 강남구 역삼동',
      '서울특별시 강남구 삼성동',
      '서울특별시 강남구 청담동',
      '서울특별시 송파구 잠실동',
      '서울특별시 송파구 방이동',
      '서울특별시 용산구 이촌동',
      '서울특별시 용산구 한남동',
      '서울특별시 관악구 신림동',
      '서울특별시 관악구 봉천동',
    ];

    return mockAddresses.filter((addr) =>
      addr.toLowerCase().includes(prefix.toLowerCase())
    );
  }

  const res = await userStore.authFetch(
    `/autocomplete?q=${encodeURIComponent(prefix)}`
  );
  if (!res.ok) {
    throw new Error('주소 검색에 실패했습니다.');
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
