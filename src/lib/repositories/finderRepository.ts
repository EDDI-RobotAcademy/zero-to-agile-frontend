import { USE_MOCK } from '@/config/env';
import { finderRequestMock } from '@/mocks/finder/request.mock';
import { ContactRequest, ContactStatus } from '@/types/contact';
import {
  FinderRequestDetail,
  FinderRequestPayload,
  FinderRequestSummary,
} from '@/types/finder';
import { userStore } from '../auth/userStore';
import {
  addContact,
  getContactsByFinder,
  updateContactStatus,
} from './contactStore';

const BASE_PATH = '/requests';
let finderRequestStore: FinderRequestDetail | null = finderRequestMock;

const RESIDENCE_TYPE_KO_MAP: Record<string, string> = {
  apartment: '아파트',
  officetel: '오피스텔',
  villa: '빌라',
  house: '단독주택',
  commercial: '상가',
};

const DEAL_TYPE_KO_MAP: Record<string, string> = {
  jeonse: '전세',
  sale: '매매',
  monthly: '월세',
};

function toKoreanResidenceType(value?: string) {
  if (!value) return value;
  return RESIDENCE_TYPE_KO_MAP[value] ?? value;
}

function toKoreanDealType(value?: string) {
  if (!value) return value;
  return DEAL_TYPE_KO_MAP[value] ?? value;
}

function toEnglishResidenceType(value?: string): string {
  if (!value) return '';
  const entry = Object.entries(RESIDENCE_TYPE_KO_MAP).find(([, ko]) => ko === value);
  return entry ? entry[0] : value;
}

function toEnglishDealType(value?: string): string {
  if (!value) return '';
  const entry = Object.entries(DEAL_TYPE_KO_MAP).find(([, ko]) => ko === value);
  return entry ? entry[0] : value;
}

function toDetail(data: any): FinderRequestDetail {
  return {
    id: data.finder_request_id ?? data.id,
    finderId: data.finder_id,
    preferredArea: data.preferred_area ?? data.prefered_area,
    residenceType: toEnglishResidenceType(data.residence_type),
    dealType: toEnglishDealType(data.deal_type),
    budget: data.budget,
    area: data.area ?? data.min_area,
    roomCount: data.room_count,
    bathroomCount: data.bathroom_count,
  };
}

function toSummary(data: any): FinderRequestSummary {
  return {
    id: data.finder_request_id ?? data.id,
    preferredArea: data.preferred_area ?? data.prefered_area,
    residenceType: toEnglishResidenceType(data.residence_type),
    dealType: toEnglishDealType(data.deal_type),
    budget: data.budget,
  };
}

function toServerPayload(payload: Partial<FinderRequestPayload>) {
  const map: Record<string, any> = {};
  if (payload.preferredArea !== undefined) map.preferred_area = payload.preferredArea;
  if (payload.residenceType !== undefined) map.residence_type = toKoreanResidenceType(payload.residenceType);
  if (payload.dealType !== undefined) map.deal_type = toKoreanDealType(payload.dealType);
  if (payload.budget !== undefined) map.budget = payload.budget;
  if (payload.area !== undefined) map.area = payload.area;
  if (payload.roomCount !== undefined) map.room_count = payload.roomCount;
  if (payload.bathroomCount !== undefined) map.bathroom_count = payload.bathroomCount;
  return map;
}

export async function listFinderRequests(): Promise<FinderRequestSummary[]> {
  if (USE_MOCK) {
    return finderRequestStore ? [toSummary(finderRequestStore)] : [];
  }

  const res = await userStore.authFetch((`${BASE_PATH}/view`)); // view
  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) {
    throw new Error('failed to fetch finder requests');
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(toSummary) : [];
}

export async function getFinderRequestById(id: number | string): Promise<FinderRequestDetail | null> {
  if (USE_MOCK) {
    return finderRequestStore;
  }

  const res = await userStore.authFetch(`${BASE_PATH}/${id}`);
  if (res.status === 404) return null;
  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) {
    throw new Error('failed to fetch finder request');
  }
  const data = await res.json();
  return toDetail(data);
}

export async function createFinderRequest(
  payload: FinderRequestPayload,
): Promise<{ finder_request_id: number }> {
  if (USE_MOCK) {
    const id = finderRequestStore?.id ?? Date.now();
    finderRequestStore = { id, ...payload };
    return { finder_request_id: id };
  }

  const res = await userStore.authFetch(`${BASE_PATH}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toServerPayload(payload)),
  });

  if (res.status === 400 || res.status === 401) {
    const err = await res.json();
    throw new Error(err?.detail ?? 'failed to create finder request');
  }
  if (!res.ok) {
    throw new Error('failed to create finder request');
  }
  return res.json();
}

export async function updateFinderRequest(
  id: number,
  payload: Partial<FinderRequestPayload>,
): Promise<{ finder_request_id: number }> {
  if (USE_MOCK) {
    if (!finderRequestStore) return { finder_request_id: id };
    finderRequestStore = { ...finderRequestStore, ...payload };
    return { finder_request_id: finderRequestStore.id };
  }

  const res = await userStore.authFetch(`${BASE_PATH}/edit/${id}`, { // edit
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toServerPayload(payload)),
  });

  if (res.status === 404 || res.status === 401 || res.status === 400) {
    const err = await res.json();
    throw new Error(err?.detail ?? 'failed to update finder request');
  }
  if (!res.ok) {
    throw new Error('failed to update finder request');
  }
  return res.json();
}

export async function deleteFinderRequest(id: number): Promise<boolean> {
  if (USE_MOCK) {
    finderRequestStore = null;
    return true;
  }

  const res = await userStore.authFetch(`${BASE_PATH}/delete/${id}`, { method: 'DELETE' }); // delete
  if (res.status === 404) return false;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? 'failed to delete finder request');
  }
  return true;
}

export async function getFinderContacts(finderId: string): Promise<ContactRequest[]> {
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
