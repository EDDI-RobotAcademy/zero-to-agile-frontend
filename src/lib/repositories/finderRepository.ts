import { USE_MOCK } from "@/config/env";
import { finderRequestMock } from "@/mocks/finder/request.mock";
import {
  FinderRequestDetail,
  FinderRequestPayload,
  FinderRequestSummary,
  PriceType,
  HouseType,
  FinderRequestStatus,
} from "@/types/finder";
import { ContactRequest, ContactStatus } from "@/types/contact";
import { userStore } from "../auth/userStore";
import {
  addContact,
  getContactsByFinder,
  updateContactStatus,
} from "./contactStore";

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
  };
}

/**
 * ======================================================
 * Mapper (frontend → server)
 * - camelCase → snake_case
 * ======================================================
 */
function toServerPayload(
  payload: Partial<FinderRequestPayload>,
): Record<string, any> {
  return {
    preferred_region: payload.preferredRegion,
    price_type: payload.priceType,
    max_deposit: payload.maxDeposit,
    max_rent: payload.maxRent,
    house_type: payload.houseType,
    additional_condition: payload.additionalCondition,
    room_count: payload.roomCount,
    bathroom_count: payload.bathroomCount,
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

  const res = await userStore.authFetch(`${BASE_PATH}/${id}`);

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
  payload: FinderRequestPayload,
): Promise<{ finder_request_id: number }> {
  if (USE_MOCK) {
    const id = Date.now();
    finderRequestStore = {
      finderRequestId: id,
          status: "N",
          ...payload,
          maxDeposit: payload.maxDeposit ?? 0,
          maxRent: payload.maxRent ?? 0,
    };
    return { finder_request_id: id };
  }

  const res = await userStore.authFetch(`${BASE_PATH}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toServerPayload(payload)),
  });

  if (!res.ok) throw new Error("FAILED_TO_CREATE_FINDER_REQUEST");
  return res.json();
}

export async function updateFinderRequest(
  id: number,
  payload: Partial<FinderRequestPayload>,
): Promise<{ finder_request_id: number }> {
  if (USE_MOCK) {
    if (!finderRequestStore) return { finder_request_id: id };
    finderRequestStore = { ...finderRequestStore, ...payload };
    return { finder_request_id: finderRequestStore.finderRequestId };
  }

  const res = await userStore.authFetch(`${BASE_PATH}/edit/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toServerPayload(payload)),
  });

  if (!res.ok) throw new Error("FAILED_TO_UPDATE_FINDER_REQUEST");
  return res.json();
}

export async function deleteFinderRequest(id: number): Promise<boolean> {
  if (USE_MOCK) {
    finderRequestStore = null;
    return true;
  }

  const res = await userStore.authFetch(`${BASE_PATH}/delete/${id}`, {
    method: "DELETE",
  });

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
