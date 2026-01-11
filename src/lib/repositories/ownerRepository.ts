import {
  HousePlatform,
  HousePlatformCreatePayload,
  HousePlatformUpdatePayload,
  OwnerRecommendation,
  HousePlatformSummary,
  MatchedFinderRequest
} from '@/types/owner';
import { userStore } from '../auth/userStore';
import { USE_MOCK } from '@/config/env';
import {
  housePlatformMock,
  housePlatformListMock,
  ownerRecommendationMock
} from '@/mocks/owner/housePlatform.mock';

/**
 * 매물 등록
 * POST /api/house_platforms
 */
export async function createHousePlatform(
  payload: HousePlatformCreatePayload
): Promise<HousePlatform> {
  if (USE_MOCK) {
    return housePlatformMock;
  }

  const res = await userStore.authFetch('/house_platforms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: payload.title,
      address: payload.address,
      deposit: payload.deposit,
      domain_id: payload.domainId,
      rgst_no: payload.rgstNo,
      sales_type: payload.salesType,
      monthly_rent: payload.monthlyRent,
      room_type: payload.roomType,
      contract_area: payload.contractArea,
      exclusive_area: payload.exclusiveArea,
      floor_no: payload.floorNo,
      all_floors: payload.allFloors,
      lat_lng: payload.latLng,
      manage_cost: payload.manageCost,
      can_park: payload.canPark,
      has_elevator: payload.hasElevator,
      image_urls: payload.imageUrls,
      pnu_cd: payload.pnuCd,
      is_banned: payload.isBanned,
      residence_type: payload.residenceType,
      gu_nm: payload.guNm,
      dong_nm: payload.dongNm,
      snapshot_id: payload.snapshotId,
    }),
  });

  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) throw new Error('FAILED_TO_CREATE_HOUSE_PLATFORM');

  const data = await res.json();
  return mapApiResponseToHousePlatform(data);
}

/**
 * 현재 로그인한 사용자가 등록한 모든 매물 조회
 * GET /api/house_platforms/me
 */
export async function getMyHousePlatforms(): Promise<HousePlatform[]> {
  if (USE_MOCK) {
    return housePlatformListMock;
  }

  const res = await userStore.authFetch('/house_platforms/me');

  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) throw new Error('FAILED_TO_FETCH_HOUSE_PLATFORMS');

  const data = await res.json();
  return Array.isArray(data) ? data.map(mapApiResponseToHousePlatform) : [];
}

/**
 * 특정 매물의 상세 정보 조회
 * GET /api/house_platforms/{house_platform_id}
 */
export async function getHousePlatformById(
  housePlatformId: number
): Promise<HousePlatform | null> {
  if (USE_MOCK) {
    return housePlatformMock;
  }

  const res = await userStore.authFetch(`/house_platforms/${housePlatformId}`);

  if (res.status === 404) return null;
  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) throw new Error('FAILED_TO_FETCH_HOUSE_PLATFORM');

  const data = await res.json();
  return mapApiResponseToHousePlatform(data);
}

/**
 * 등록한 매물 정보 수정
 * PUT /api/house_platforms/{house_platform_id}
 */
export async function updateHousePlatform(
  housePlatformId: number,
  payload: HousePlatformUpdatePayload
): Promise<HousePlatform> {
  if (USE_MOCK) {
    return housePlatformMock;
  }

  const body: any = {};

  if (payload.title !== undefined) body.title = payload.title;
  if (payload.address !== undefined) body.address = payload.address;
  if (payload.deposit !== undefined) body.deposit = payload.deposit;
  if (payload.rgstNo !== undefined) body.rgst_no = payload.rgstNo;
  if (payload.salesType !== undefined) body.sales_type = payload.salesType;
  if (payload.monthlyRent !== undefined) body.monthly_rent = payload.monthlyRent;
  if (payload.roomType !== undefined) body.room_type = payload.roomType;
  if (payload.contractArea !== undefined) body.contract_area = payload.contractArea;
  if (payload.exclusiveArea !== undefined) body.exclusive_area = payload.exclusiveArea;
  if (payload.floorNo !== undefined) body.floor_no = payload.floorNo;
  if (payload.allFloors !== undefined) body.all_floors = payload.allFloors;
  if (payload.latLng !== undefined) body.lat_lng = payload.latLng;
  if (payload.manageCost !== undefined) body.manage_cost = payload.manageCost;
  if (payload.canPark !== undefined) body.can_park = payload.canPark;
  if (payload.hasElevator !== undefined) body.has_elevator = payload.hasElevator;
  if (payload.imageUrls !== undefined) body.image_urls = payload.imageUrls;
  if (payload.pnuCd !== undefined) body.pnu_cd = payload.pnuCd;
  if (payload.isBanned !== undefined) body.is_banned = payload.isBanned;
  if (payload.residenceType !== undefined) body.residence_type = payload.residenceType;
  if (payload.guNm !== undefined) body.gu_nm = payload.guNm;
  if (payload.dongNm !== undefined) body.dong_nm = payload.dongNm;
  if (payload.snapshotId !== undefined) body.snapshot_id = payload.snapshotId;

  const res = await userStore.authFetch(`/house_platforms/${housePlatformId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) throw new Error('FAILED_TO_UPDATE_HOUSE_PLATFORM');

  const data = await res.json();
  return mapApiResponseToHousePlatform(data);
}

/**
 * 등록한 매물 삭제
 * DELETE /api/house_platforms/{house_platform_id}
 */
export async function deleteHousePlatform(
  housePlatformId: number
): Promise<void> {
  if (USE_MOCK) {
    return;
  }

  const res = await userStore.authFetch(`/house_platforms/${housePlatformId}`, {
    method: 'DELETE',
  });

  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) throw new Error('FAILED_TO_DELETE_HOUSE_PLATFORM');
}

/**
 * owner 추천 매물 조회
 * GET /api/owner_recommendations/me
 * 내 매물 중 임차인 요구서와 조건이 맞는 추천 결과를 조회합니다.
 */
export async function getOwnerRecommendations(
  rentMargin: number = 5
): Promise<OwnerRecommendation> {
  if (USE_MOCK) {
    return ownerRecommendationMock;
  }

  const res = await userStore.authFetch(
    `/owner_recommendations/me?rent_margin=${rentMargin}`
  );

  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) throw new Error('FAILED_TO_FETCH_OWNER_RECOMMENDATIONS');

  const data = await res.json();
  return mapApiResponseToOwnerRecommendation(data);
}

/**
 * API 응답을 HousePlatform 타입으로 변환
 */
function mapApiResponseToHousePlatform(data: any): HousePlatform {
  return {
    housePlatformId: data.house_platform_id,
    title: data.title,
    address: data.address,
    deposit: data.deposit,
    domainId: data.domain_id,
    rgstNo: data.rgst_no,
    salesType: data.sales_type,
    monthlyRent: data.monthly_rent,
    roomType: data.room_type,
    contractArea: data.contract_area,
    exclusiveArea: data.exclusive_area,
    floorNo: data.floor_no,
    allFloors: data.all_floors,
    latLng: data.lat_lng,
    manageCost: data.manage_cost,
    canPark: data.can_park,
    hasElevator: data.has_elevator,
    imageUrls: data.image_urls,
    pnuCd: data.pnu_cd,
    isBanned: data.is_banned,
    residenceType: data.residence_type,
    guNm: data.gu_nm,
    dongNm: data.dong_nm,
    registeredAt: data.registered_at,
    crawledAt: data.crawled_at,
    snapshotId: data.snapshot_id,
    abangUserId: data.abang_user_id,
    phoneNumber: data.phone_number,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * API 응답을 OwnerRecommendation 타입으로 변환
 */
function mapApiResponseToOwnerRecommendation(data: any): OwnerRecommendation {
  return {
    abangUserId: data.abang_user_id,
    rentMargin: data.rent_margin,
    totalRecommendedHouses: data.total_recommended_houses,
    totalMatchedRequests: data.total_matched_requests,
    results: data.results.map((result: any) => ({
      housePlatform: {
        housePlatformId: result.house_platform.house_platform_id,
        title: result.house_platform.title,
        address: result.house_platform.address,
        salesType: result.house_platform.sales_type,
        residenceType: result.house_platform.residence_type,
        monthlyRent: result.house_platform.monthly_rent,
        deposit: result.house_platform.deposit,
        roomType: result.house_platform.room_type,
        guNm: result.house_platform.gu_nm,
        dongNm: result.house_platform.dong_nm,
      },
      matchedFinderRequests: result.matched_finder_requests.map((request: any) => ({
        finderRequestId: request.finder_request_id,
        abangUserId: request.abang_user_id,
        priceType: request.price_type,
        houseType: request.house_type,
        maxRent: request.max_rent,
        preferredRegion: request.preferred_region,
      })),
    })),
  };
}
