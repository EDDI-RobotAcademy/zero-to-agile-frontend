import { listingMocks } from '@/mocks/listings.mock';
import { Listing } from '@/types/listing';
import { TenantRequestDetail } from '@/types/tenant';
import { userStore } from '../auth/userStore';

const BASE_PATH = '/tenant/recommendations';

let listingStore: Listing[] = [...listingMocks];

const DEAL_TYPE_KO_MAP: Record<string, string> = {
  jeonse: '전세',
  sale: '매매',
  monthly: '월세',
};

const RESIDENCE_TYPE_KO_MAP: Record<string, string> = {
  apartment: '아파트',
  officetel: '오피스텔',
  villa: '빌라',
  house: '단독주택',
  commercial: '상가',
};

function toKoreanDealType(value?: string) {
  if (!value) return value;
  return DEAL_TYPE_KO_MAP[value] ?? value;
}

function mapDealType(dealType: string | undefined): Listing['contractType'] {
  if (!dealType) return 'jeonse';
  if (['jeonse', '전세'].includes(dealType)) return 'jeonse';
  if (['monthly', '월세'].includes(dealType)) return 'jeonse'; // 보증금 기준 응답을 price로 사용
  return 'sale';
}

function extractRegion(address?: string): { region: string; district: string } {
  if (!address) return { region: '', district: '' };
  const parts = address.split(' ');
  return {
    region: parts[0] ?? '',
    district: parts[1] ?? parts[0] ?? '',
  };
}

function toListing(item: any): Listing {
  const { region, district } = extractRegion(item.address);
  const contractType = mapDealType(item.deal_type);
  const price =
    contractType === 'sale'
      ? item.cost ?? 0
      : item.deposit ?? item.cost ?? 0;

  const mapped: Listing = {
    id: String(item.real_estate_id ?? item.id ?? `listing-${Date.now()}`),
    title: item.title ?? '추천 매물',
    region,
    district,
    type: 'apartment',
    contractType,
    price,
    area: item.area ?? 0,
    rooms: item.room_count ?? 0,
    bathrooms: item.bathroom_count ?? 0,
    floor: item.floor ?? 0,
    options: item.amenities ?? [],
    images: item.images ?? ['https://picsum.photos/seed/zt2/600/400'],
    description: item.description ?? '',
    aiDescription: item.ai_description,
    ownerId: item.owner_id ?? 'unknown',
    createdAt: item.first_create_dt ?? new Date().toISOString(),
    status: 'active',
  };

  return mapped;
}

function toRecommendPayload(tenantRequest?: TenantRequestDetail | null) {
  if (!tenantRequest) return {};
  return {
    preferred_area: tenantRequest.preferredArea,
    area: tenantRequest.area,
    room_count: tenantRequest.roomCount,
    bathroom_count: tenantRequest.bathroomCount,
    deal_type: toKoreanDealType(tenantRequest.dealType),
    budget: tenantRequest.budget,
    limit: 20,
  };
}

export async function listRecommendedListings(
  tenantRequest?: TenantRequestDetail | null,
): Promise<Listing[]> {
  // 요청 조건을 서버 DTO에 맞게 매핑
  const payload = toRecommendPayload(tenantRequest);

  try {
    const res = await userStore.authFetch(BASE_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) throw new Error('UNAUTHENTICATED');
    if (!res.ok) throw new Error('failed to fetch recommendations');

    const data = await res.json();
    const list = Array.isArray(data) ? data.map(toListing) : [];

    // 상세 페이지 조회를 위해 최신 추천 결과를 캐시
    listingStore = list;
    return list;
  } catch (err) {
    console.error('listRecommendedListings failed', err);
    // 에러를 그대로 올려서 화면에서 백엔드 연결 오류를 보여주도록 한다.
    throw err instanceof Error ? err : new Error('failed to fetch recommendations');
  }
}

export async function getListingById(id: string): Promise<Listing | null> {
  const cached = listingStore.find((item) => item.id === id);
  if (cached) return cached;

  // 캐시에 없으면 기본 추천을 다시 가져와 채운 뒤 탐색
  const refreshed = await listRecommendedListings();
  return refreshed.find((item) => item.id === id) ?? null;
}

export async function listLandlordListings(landlordId: string): Promise<Listing[]> {
  const res = await listRecommendedListings();
  return res.filter((listing) => listing.ownerId === landlordId);
}

export async function createListing(
  payload: Omit<Listing, 'id' | 'createdAt'>,
): Promise<Listing> {
  const newListing: Listing = {
    ...payload,
    id: `listing-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  listingStore = [newListing, ...listingStore];
  return newListing;
}
