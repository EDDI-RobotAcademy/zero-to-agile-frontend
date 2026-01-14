import {
  FinderRequest,
  FinderRequestCreatePayload,
  FinderRequestUpdatePayload,
  RecommendationReport,
} from '@/types/finder';
import { userStore } from '../auth/userStore';
import { USE_MOCK } from '@/config/env';
import {
  finderRequestMock,
  finderRequestListMock,
} from '@/mocks/finder/finderRequest.mock';
import { finderRecommendationsReportMock } from '@/mocks/finder/recommendationsReport.mock';

/**
 * 임차인 요구서 생성
 * POST /api/requests/create
 */
export async function createFinderRequest(
  payload: FinderRequestCreatePayload
): Promise<FinderRequest> {
  if (USE_MOCK) {
    return finderRequestMock;
  }

  const res = await userStore.authFetch('/requests/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preferred_region: payload.preferredRegion,
      price_type: payload.priceType,
      max_deposit: payload.maxDeposit,
      max_rent: payload.maxRent,
      house_type: payload.houseType,
      additional_condition: payload.additionalCondition,
      university_name: payload.universityName,
      roomcount: payload.roomcount,
      bathroomcount: payload.bathroomcount,
      is_near: payload.isNear,
      aircon_yn: payload.airconYn,
      washer_yn: payload.washerYn,
      fridge_yn: payload.fridgeYn,
      max_building_age: payload.maxBuildingAge,
      status: 'Y',
    }),
  });

  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) throw new Error('FAILED_TO_CREATE_FINDER_REQUEST');

  const data = await res.json();
  return mapApiResponseToFinderRequest(data);
}

/**
 * 현재 로그인한 사용자의 모든 요구서 조회
 * GET /api/requests/view
 */
export async function getFinderRequests(): Promise<FinderRequest[]> {
  if (USE_MOCK) {
    return finderRequestListMock;
  }

  const res = await userStore.authFetch('/requests/view');

  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) throw new Error('FAILED_TO_FETCH_FINDER_REQUESTS');

  const data = await res.json();
  return Array.isArray(data) ? data.map(mapApiResponseToFinderRequest) : [];
}

/**
 * 특정 요구서의 상세 정보 조회
 * GET /api/requests/view/{finder_request_id}
 */
export async function getFinderRequestById(
  finderRequestId: number
): Promise<FinderRequest | null> {
  if (USE_MOCK) {
    return finderRequestMock;
  }

  const res = await userStore.authFetch(`/requests/view/${finderRequestId}`);

  if (res.status === 404) return null;
  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) throw new Error('FAILED_TO_FETCH_FINDER_REQUEST');

  const data = await res.json();
  return mapApiResponseToFinderRequest(data);
}

/**
 * 등록한 요구서 정보 수정
 * PUT /api/requests/edit
 */
export async function updateFinderRequest(
  finderRequestId: number,
  payload: FinderRequestUpdatePayload
): Promise<FinderRequest> {
  if (USE_MOCK) {
    return finderRequestMock;
  }

  const body: any = {
    finder_request_id: finderRequestId,
  };

  if (payload.preferredRegion !== undefined) body.preferred_region = payload.preferredRegion;
  if (payload.priceType !== undefined) body.price_type = payload.priceType;
  if (payload.maxDeposit !== undefined) body.max_deposit = payload.maxDeposit;
  if (payload.maxRent !== undefined) body.max_rent = payload.maxRent;
  if (payload.houseType !== undefined) body.house_type = payload.houseType;
  if (payload.additionalCondition !== undefined) body.additional_condition = payload.additionalCondition;
  if (payload.universityName !== undefined) body.university_name = payload.universityName;
  if (payload.roomcount !== undefined) body.roomcount = payload.roomcount;
  if (payload.bathroomcount !== undefined) body.bathroomcount = payload.bathroomcount;
  if (payload.isNear !== undefined) body.is_near = payload.isNear;
  if (payload.airconYn !== undefined) body.aircon_yn = payload.airconYn;
  if (payload.washerYn !== undefined) body.washer_yn = payload.washerYn;
  if (payload.fridgeYn !== undefined) body.fridge_yn = payload.fridgeYn;
  if (payload.maxBuildingAge !== undefined) body.max_building_age = payload.maxBuildingAge;
  if (payload.status !== undefined) body.status = payload.status;

  const res = await userStore.authFetch('/requests/edit', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) throw new Error('FAILED_TO_UPDATE_FINDER_REQUEST');

  const data = await res.json();
  return mapApiResponseToFinderRequest(data);
}

/**
 * 등록한 요구서 삭제
 * DELETE /api/requests/delete
 */
export async function deleteFinderRequest(
  finderRequestId: number
): Promise<void> {
  if (USE_MOCK) {
    return;
  }

  const res = await userStore.authFetch(`/requests/delete?finder_request_id=${finderRequestId}`, {
    method: 'DELETE',
  });

  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) throw new Error('FAILED_TO_DELETE_FINDER_REQUEST');
}

/**
 * 모든 대학교 이름 조회
 * GET /api/universities/names
 */
export async function getUniversityNames(): Promise<string[]> {
  if (USE_MOCK) {
    return [
      '가천대학교',
      '강남대학교',
      '건국대학교',
      '경기대학교',
      '경북대학교',
      '경희대학교',
      '고려대학교',
      '광운대학교',
      '국민대학교',
      '단국대학교',
      '덕성여자대학교',
      '동국대학교',
      '동덕여자대학교',
      '명지대학교',
      '부산대학교',
      '서강대학교',
      '서울과학기술대학교',
      '서울대학교',
      '서울시립대학교',
      '서울여자대학교',
      '성균관대학교',
      '성신여자대학교',
      '세종대학교',
      '숙명여자대학교',
      '숭실대학교',
      '아주대학교',
      '연세대학교',
      '영남대학교',
      '이화여자대학교',
      '인천대학교',
      '인하대학교',
      '전남대학교',
      '전북대학교',
      '중앙대학교',
      '충남대학교',
      '충북대학교',
      '한국외국어대학교',
      '한국항공대학교',
      '한양대학교',
      '홍익대학교',
    ];
  }

  const res = await userStore.authFetch('/universities/names');

  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) throw new Error('FAILED_TO_FETCH_UNIVERSITY_NAMES');

  const data = await res.json();
  return data.universities || [];
}

/**
 * 매물 추천 시작
 * POST /api/search_house
 */
export async function startRecommendation(
  finderRequestId: number
): Promise<{ search_house_id: string }> {
  if (USE_MOCK) {
    return { search_house_id: 'mock-search-id' };
  }

  const res = await fetch('/api/search_house', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ finder_request_id: finderRequestId }),
  });

  if (!res.ok) throw new Error('추천 요청에 실패했습니다.');

  const data = await res.json();
  const { search_house_id } = data;

  if (!search_house_id) throw new Error('search_house_id를 받지 못했습니다.');

  return { search_house_id };
}

/**
 * 매물 추천 상태 조회 (폴링용)
 * GET /api/search_house/${searchHouseId}
 */
export async function getRecommendationStatus(
  searchHouseId: string
): Promise<{
  status: string;
  result?: RecommendationReport;
}> {
  if (USE_MOCK) {
    return {
      status: 'COMPLETED',
      result: finderRecommendationsReportMock,
    };
  }

  const res = await fetch(`/api/search_house/${searchHouseId}`);

  if (!res.ok) throw new Error('추천 상태 조회에 실패했습니다.');

  const data = await res.json();

  // result_json이 있으면 우선 사용 (실제 추천 리포트가 여기 있을 가능성 높음)
  let reportData = undefined;
  if (data.status === 'COMPLETED') {
    if (data.result_json) {
      try {
        reportData = typeof data.result_json === 'string'
          ? JSON.parse(data.result_json)
          : data.result_json;
      } catch (e) {
        reportData = data.result ?? data;
      }
    } else if (data.result) {
      reportData = data.result;
    } else {
      reportData = data;
    }
  }

  return {
    status: data.status?.toUpperCase?.() || 'PROCESSING',
    result: reportData,
  };
}

/**
 * API 응답을 FinderRequest 타입으로 변환
 */
function mapApiResponseToFinderRequest(data: any): FinderRequest {
  return {
    finderRequestId: data.finder_request_id,
    abangUserId: data.abang_user_id,
    preferredRegion: data.preferred_region,
    priceType: data.price_type,
    maxDeposit: data.max_deposit,
    maxRent: data.max_rent,
    status: data.status,
    houseType: data.house_type,
    additionalCondition: data.additional_condition,
    universityName: data.university_name,
    roomcount: data.roomcount,
    bathroomcount: data.bathroomcount,
    isNear: data.is_near,
    airconYn: data.aircon_yn,
    washerYn: data.washer_yn,
    fridgeYn: data.fridge_yn,
    maxBuildingAge: data.max_building_age,
    phoneNumber: data.phone_number,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
