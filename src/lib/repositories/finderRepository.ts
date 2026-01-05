import { USE_MOCK } from "@/config/env";
import { finderRequestMock } from "@/mocks/finder/request.mock";
import {
  FinderRequestDetail,
  FinderRequestUpdatePayload,
  FinderRequestCreatePayload,
  FinderRequestSummary,
  PriceType,
  HouseType,
  FinderRequestStatus,
} from "@/types/finder";
import { ContactRequest, ContactStatus, SendMessage, SendMessageDetail, AcceptType } from "@/types/contact";
import { userStore } from "../auth/userStore";
import {
  addContact,
  getContactsByFinder,
  updateContactStatus,
} from "./contactStore";
import { sendMessageMocks } from "@/mocks/finder/sendMessage.mock";

const BASE_PATH = "/requests";

/**
 * mock 저장소
 */
let finderRequestStore: FinderRequestDetail | null = finderRequestMock;

/**
 * ======================================================
 * Mapper (server → frontend)
 * - snake_case → camelCase
 * ======================================================
 */

function toFinderRequestSummary(data: any): FinderRequestSummary {
  return {
    id: Number(data.id ?? data.finder_request_id ?? 0),  // 추가
    finderRequestId: data.finder_request_id,
    preferredRegion: data.preferred_region ?? "",
    priceType: data.price_type as PriceType,
    maxDeposit: data.max_deposit ?? 0,
    maxRent: data.max_rent ?? 0,
    houseType: data.house_type as HouseType,
    status: (data.status ?? "N") as FinderRequestStatus,
  };
}

function toFinderRequestDetail(data: any): FinderRequestDetail {
  return {
    id: Number(data.id ?? data.finder_request_id ?? 0),  // 추가
    finderId: data.finder_id ?? data.finderId,           // 추가(있으면 매핑)

    finderRequestId: data.finder_request_id,
    preferredRegion: data.preferred_region ?? "",
    priceType: data.price_type as PriceType,
    maxDeposit: data.max_deposit ?? 0,
    maxRent: data.max_rent ?? 0,
    houseType: data.house_type as HouseType,
    status: (data.status ?? "N") as FinderRequestStatus,

    // UI에서 쓰는 값들(있으면 매핑되게)
    preferredArea: data.preferred_area,
    residenceType: data.residence_type,
    dealType: data.deal_type,
    budget: data.budget,
    area: data.area,

    createdAt: data.created_at,
    updatedAt: data.updated_at,
    additionalCondition: data.additional_condition,
    roomCount: data.room_count,
    bathroomCount: data.bathroom_count,
    phoneNumber: data.phone_number,
    isNear: data.is_near,
    airconYn: data.aircon_yn,
    washerYn: data.washer_yn,
    fridgeYn: data.fridge_yn,
    useaprYear: data.useapr_year,
  };
}

/**
 * ======================================================
 * Mapper (frontend → server)
 * - camelCase → snake_case
 * ======================================================
 */

// function toServerPayload(
//   payload: Partial<FinderRequestPayload>,
// ): Record<string, any> {
//   return {
//     preferred_region: payload.preferredRegion,
//     price_type: payload.priceType,
//     max_deposit: payload.maxDeposit,
//     max_rent: payload.maxRent,
//     house_type: payload.houseType,
//     additional_condition: payload.additionalCondition,
//     room_count: payload.roomCount,
//     bathroom_count: payload.bathroomCount,
//   };
// }

function toCreateServerPayload(payload: FinderRequestCreatePayload) {
  return {
    preferred_region: payload.preferredRegion,
    price_type: payload.priceType,
    max_deposit: payload.maxDeposit ?? 0,
    max_rent: payload.maxRent ?? 0,
    house_type: payload.houseType,
    additional_condition: payload.additionalCondition || '',
    phone_number: payload.phoneNumber,
    is_near: payload.isNear,
    aircon_yn: payload.airconYn,
    washer_yn: payload.washerYn,
    fridge_yn: payload.fridgeYn,
    useapr_year: payload.useaprYear,
    status: "Y",
  };
}

// Update 전용: 변경된 값만 보냄
function toUpdateServerPayload(payload: FinderRequestUpdatePayload) {
  return {
    finder_request_id: payload.finder_request_id,

    ...(payload.preferredRegion !== undefined && {
      preferred_region: payload.preferredRegion,
    }),
    ...(payload.priceType !== undefined && {
      price_type: payload.priceType,
    }),
    ...(payload.maxDeposit !== undefined && {
      max_deposit: payload.maxDeposit,
    }),
    ...(payload.maxRent !== undefined && {
      max_rent: payload.maxRent,
    }),
    ...(payload.houseType !== undefined && {
      house_type: payload.houseType,
    }),
    ...(payload.additionalCondition !== undefined && {
      additional_condition: payload.additionalCondition,
    }),
    ...(payload.phoneNumber !== undefined && {
      phone_number: payload.phoneNumber,
    }),
    ...(payload.isNear !== undefined && {
      is_near: payload.isNear,
    }),
    ...(payload.airconYn !== undefined && {
      aircon_yn: payload.airconYn,
    }),
    ...(payload.washerYn !== undefined && {
      washer_yn: payload.washerYn,
    }),
    ...(payload.fridgeYn !== undefined && {
      fridge_yn: payload.fridgeYn,
    }),
    ...(payload.useaprYear !== undefined && {
      useapr_year: payload.useaprYear,
    }),
    ...(payload.status !== undefined && {
      status: payload.status,
    }),
  };
}

/**
 * ======================================================
 * 조회 API
 * ======================================================
 */

export async function listFinderRequests(): Promise<FinderRequestSummary[]> {
  if (USE_MOCK) {
    return finderRequestStore
      ? [toFinderRequestSummary(finderRequestStore)]
      : [];
  }

  const res = await userStore.authFetch(`${BASE_PATH}/view`);

  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (!res.ok) throw new Error("FAILED_TO_FETCH_FINDER_REQUESTS");

  const data = await res.json();
  return Array.isArray(data) ? data.map(toFinderRequestSummary) : [];
}

export async function getFinderRequestById(
  id: number,
): Promise<FinderRequestDetail | null> {
  if (USE_MOCK) {
    return finderRequestStore;
  }

  const res = await userStore.authFetch(`${BASE_PATH}/view/${id}`);

  if (res.status === 404) return null;
  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (!res.ok) throw new Error("FAILED_TO_FETCH_FINDER_REQUEST_DETAIL");

  const data = await res.json();
  return toFinderRequestDetail(data);
}

/**
 * ======================================================
 * Create, Update, Delete
 * ======================================================
 */

export async function createFinderRequest(
  payload: FinderRequestCreatePayload,
): Promise<{ finder_request_id: number }> {
  const res = await userStore.authFetch(`${BASE_PATH}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toCreateServerPayload(payload)),
  });

  if (!res.ok) throw new Error("FAILED_TO_CREATE_FINDER_REQUEST");
  return res.json();
}

export async function updateFinderRequest(
  id: number,
  payload: FinderRequestUpdatePayload,
): Promise<{ finder_request_id: number }> {

  const res = await userStore.authFetch(`${BASE_PATH}/edit`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toUpdateServerPayload({ ...payload, finder_request_id: id })),
  });

  if (!res.ok) throw new Error("FAILED_TO_UPDATE_FINDER_REQUEST");
  return res.json();
}

export async function deleteFinderRequest(id: number): Promise<boolean> {
  if (USE_MOCK) {
    finderRequestStore = null;
    return true;
  }

  const res = await userStore.authFetch(
    `${BASE_PATH}/delete?finder_request_id=${id}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );
  
  if (res.status === 404) return false;
  if (!res.ok) throw new Error("FAILED_TO_DELETE_FINDER_REQUEST");
  return true;
}

/**
 * ======================================================
 * Contact 연관 (추후 수정)
 * ======================================================
 */

export async function getFinderContacts(
  finderId: string,
): Promise<ContactRequest[]> {
  return getContactsByFinder(finderId);
}

export async function updateFinderContactStatus(
  contactId: string,
  status: ContactStatus,
): Promise<ContactRequest | null> {
  return updateContactStatus(contactId, status);
}

export function appendFinderContact(contact: ContactRequest) {
  addContact(contact);
}

/**
 * ======================================================
 * SendMessage (컨텍 요청) API
 * ======================================================
 */

/**
 * 임차인이 받은 컨텍 요청 목록 조회 (accept_type = 'N' 제외)
 */
export async function getSendMessages(finderRequestId?: number): Promise<SendMessageDetail[]> {
  if (USE_MOCK) {
    // accept_type이 'N'인 것은 제외
    return sendMessageMocks.filter(msg => msg.acceptType !== 'N');
  }

  const url = finderRequestId
    ? `/send-messages?finder_request_id=${finderRequestId}`
    : '/send-messages';

  const res = await userStore.authFetch(url);

  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (!res.ok) throw new Error("FAILED_TO_FETCH_SEND_MESSAGES");

  const data = await res.json();
  return Array.isArray(data) ? data.filter((msg: any) => msg.accept_type !== 'N').map(toSendMessageDetail) : [];
}

/**
 * 컨텍 요청 상세 조회
 */
export async function getSendMessageById(id: number): Promise<SendMessageDetail | null> {
  if (USE_MOCK) {
    return sendMessageMocks.find(msg => msg.sendMessageId === id) || null;
  }

  const res = await userStore.authFetch(`/send-messages/${id}`);

  if (res.status === 404) return null;
  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (!res.ok) throw new Error("FAILED_TO_FETCH_SEND_MESSAGE_DETAIL");

  const data = await res.json();
  return toSendMessageDetail(data);
}

/**
 * 컨텍 요청 수락
 */
export async function acceptSendMessage(id: number): Promise<boolean> {
  if (USE_MOCK) {
    const msg = sendMessageMocks.find(m => m.sendMessageId === id);
    if (msg) {
      msg.acceptType = 'Y';
      msg.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  const res = await userStore.authFetch(`/send-messages/${id}/accept`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error("FAILED_TO_ACCEPT_SEND_MESSAGE");
  return true;
}

/**
 * 컨텍 요청 거절
 */
export async function rejectSendMessage(id: number): Promise<boolean> {
  if (USE_MOCK) {
    const msg = sendMessageMocks.find(m => m.sendMessageId === id);
    if (msg) {
      msg.acceptType = 'N';
      msg.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  const res = await userStore.authFetch(`/send-messages/${id}/reject`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error("FAILED_TO_REJECT_SEND_MESSAGE");
  return true;
}

/**
 * ======================================================
 * Mapper (server → frontend) for SendMessage
 * ======================================================
 */
function toSendMessageDetail(data: any): SendMessageDetail {
  return {
    sendMessageId: data.send_message_id ?? data.sendMessageId,
    ownerHouseId: data.owner_house_id ?? data.ownerHouseId,
    finderRequestId: data.finder_request_id ?? data.finderRequestId,
    acceptType: (data.accept_type ?? data.acceptType) as AcceptType,
    message: data.message,
    createdAt: data.created_at ?? data.createdAt,
    updatedAt: data.updated_at ?? data.updatedAt,
    // 매물 정보
    houseTitle: data.house_title ?? data.houseTitle,
    houseAddress: data.house_address ?? data.houseAddress,
    houseDeposit: data.house_deposit ?? data.houseDeposit,
    houseMonthlyRent: data.house_monthly_rent ?? data.houseMonthlyRent,
    houseType: data.house_type ?? data.houseType,
    // 임대인 정보
    ownerName: data.owner_name ?? data.ownerName,
    ownerPhone: data.owner_phone ?? data.ownerPhone,
    // owner_house 테이블 상세 정보
    abangUserId: data.abang_user_id ?? data.abangUserId,
    address: data.address,
    priceType: data.price_type ?? data.priceType,
    deposit: data.deposit,
    rent: data.rent,
    isActive: data.is_active ?? data.isActive,
    openFrom: data.open_from ?? data.openFrom,
    openTo: data.open_to ?? data.openTo,
    houseCreatedAt: data.house_created_at ?? data.houseCreatedAt,
    houseUpdatedAt: data.house_updated_at ?? data.houseUpdatedAt,
  };
}
