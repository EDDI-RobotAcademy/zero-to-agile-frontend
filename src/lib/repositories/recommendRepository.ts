import { RecommendedListing, RecommendationResult, RiskFlag } from '@/types/recommended';
import { Listing } from '@/types/listing';
import { FinderRequestDetail } from '@/types/finder';
import { userStore } from '../auth/userStore';
import { recommendationsMock } from '@/mocks/recommendations.mock';
import { USE_MOCK } from '@/config/env';

const BASE_PATH = '/finder/recommendations';

let recommendedListingStore: RecommendedListing[] = [];

function mapResidenceType(residenceType?: string): Listing['type'] {
  if (!residenceType) return 'apartment';

  const typeMap: Record<string, Listing['type']> = {
    '오피스텔': 'officetel',
    '아파트': 'apartment',
    '공동주택': 'apartment',
    '빌라': 'villa',
    '단독주택': 'house',
    '다세대주택': 'villa',
    '도시형생활주택': 'officetel',
    '상가': 'commercial',
  };
  return typeMap[residenceType] ?? 'apartment';
}

function mapSalesType(salesType: string): Listing['contractType'] {
  if (salesType === '전세') return 'jeonse';
  if (salesType === '월세') return 'jeonse'; // 월세도 jeonse로 처리 (보증금 표시)
  if (salesType === '매매') return 'sale';
  return 'jeonse';
}

function calculateRiskLevel(riskFlags: RiskFlag[]): 'low' | 'medium' | 'high' {
  if (!riskFlags || riskFlags.length === 0) return 'low';

  const hasHigh = riskFlags.some(flag => flag.severity === 'high');
  const hasMedium = riskFlags.some(flag => flag.severity === 'medium');

  if (hasHigh) return 'high';
  if (hasMedium) return 'medium';
  return 'low';
}

export function toRecommendedListing(result: RecommendationResult): RecommendedListing {
  const house = result.house;
  const address = house.address || '';
  const parts = address.split(' ');

  // 주소 파싱 (예: "서울시 마포구 연남동 260-20")
  const region = parts[0] || '서울시';
  const district = parts[1] || '';
  const dong = parts[2] || '';

  const contractType = mapSalesType(house.sales_type);
  const propertyType = mapResidenceType(house.residence_type);

  const riskLevel = calculateRiskLevel(result.risk_flags);
  const riskDescription = result.risk_flags
    .map(flag => flag.message)
    .join(', ');

  const mapped: RecommendedListing = {
    id: String(house.house_platform_id ?? `house-${Date.now()}`),
    title: house.title,
    region,
    district,
    dong,
    type: propertyType,
    contractType,
    price: house.deposit,
    monthlyRent: house.monthly_rent,
    salesType: house.sales_type,
    manageCost: house.manage_cost,
    allFloors: house.all_floors,
    canPark: house.can_park,
    hasElevator: house.has_elevator,
    area: house.exclusive_area ?? house.contract_area ?? 0,
    rooms: 0, // API에 없음
    bathrooms: 0, // API에 없음
    floor: house.floor ?? 0,
    options: [
      house.can_park ? '주차 가능' : '',
      house.has_elevator ? '엘리베이터' : '',
      house.room_type ? house.room_type : '',
      ...(house.built_in ?? []),
      ...(house.management_included ?? []),
      ...(house.management_excluded ?? []),
    ].filter(Boolean),
    images: house.image_urls ?? ['https://picsum.photos/seed/default/600/400'],
    description: house.address,
    aiDescription: result.why_recommended.join('\n'),
    aiReason: result.why_recommended[0] ?? '',
    aiReasons: result.why_recommended,
    riskLevel,
    riskDescription,
    riskFlags: result.risk_flags,
    rank: result.rank,
    matchScore: result.match.score,
    ownerId: 'unknown',
    createdAt: house.created_at ?? new Date().toISOString(),
    status: 'active',
  };

  return mapped;
}

function toRecommendPayload(finderRequest?: FinderRequestDetail | null) {
  if (!finderRequest) return {};
  return {
    preferred_region: finderRequest.preferredRegion,
    house_type: finderRequest.houseType,
    price_type: finderRequest.priceType,
    max_deposit: finderRequest.maxDeposit,
    max_rent: finderRequest.maxRent,
    additional_condition: finderRequest.additionalCondition,
  };
}

export async function listRecommendations(
  finderRequest?: FinderRequestDetail | null,
): Promise<RecommendedListing[]> {
  // 목 데이터 사용
  if (USE_MOCK) {
    const results = recommendationsMock.results;
    const list = results.map(toRecommendedListing);
    recommendedListingStore = list;
    return list;
  }

  const payload = toRecommendPayload(finderRequest);

  try {
    const res = await userStore.authFetch(BASE_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) throw new Error('UNAUTHENTICATED');
    if (!res.ok) throw new Error('failed to fetch recommendations');

    const data = await res.json();

    // API 응답 형식: { results: RecommendationResult[] }
    const results = data.results ?? [];
    const list = Array.isArray(results)
      ? results.map(toRecommendedListing)
      : [];

    // 상세 페이지 조회를 위해 최신 추천 결과를 캐시
    recommendedListingStore = list;
    return list;
  } catch (err) {
    console.error('listRecommendations failed', err);
    throw err instanceof Error ? err : new Error('failed to fetch recommendations');
  }
}

export async function getRecommendationById(id: string): Promise<RecommendedListing | null> {
  const cached = recommendedListingStore.find((item) => item.id === id);
  if (cached) return cached;

  // 캐시에 없으면 null 반환
  return null;
}
