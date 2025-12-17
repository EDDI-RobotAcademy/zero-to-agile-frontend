import { USE_MOCK } from '@/config/env';
import { tenantRequestMock } from '@/mocks/tenant/request.mock';
import { ContactRequest, ContactStatus } from '@/types/contact';
import {
  TenantRequestDetail,
  TenantRequestPayload,
  TenantRequestSummary,
} from '@/types/tenant';
import { userStore } from '../auth/userStore';
import {
  addContact,
  getContactsByTenant,
  updateContactStatus,
} from './contactStore';

const BASE_PATH = '/tenant/request';
let tenantRequestStore: TenantRequestDetail | null = tenantRequestMock;

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

function toEnglishResidenceType(value?: string) {
  if (!value) return value;
  const entry = Object.entries(RESIDENCE_TYPE_KO_MAP).find(([, ko]) => ko === value);
  return entry ? entry[0] : value;
}

function toEnglishDealType(value?: string) {
  if (!value) return value;
  const entry = Object.entries(DEAL_TYPE_KO_MAP).find(([, ko]) => ko === value);
  return entry ? entry[0] : value;
}

function toDetail(data: any): TenantRequestDetail {
  return {
    id: data.tenant_request_id ?? data.id,
    tenantId: data.tenant_id,
    preferredArea: data.preferred_area ?? data.prefered_area,
    residenceType: toEnglishResidenceType(data.residence_type),
    dealType: toEnglishDealType(data.deal_type),
    budget: data.budget,
    area: data.area ?? data.min_area,
    roomCount: data.room_count,
    bathroomCount: data.bathroom_count,
  };
}

function toSummary(data: any): TenantRequestSummary {
  return {
    id: data.tenant_request_id ?? data.id,
    preferredArea: data.preferred_area ?? data.prefered_area,
    residenceType: toEnglishResidenceType(data.residence_type),
    dealType: toEnglishDealType(data.deal_type),
    budget: data.budget,
  };
}

function toServerPayload(payload: Partial<TenantRequestPayload>) {
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

export async function listTenantRequests(): Promise<TenantRequestSummary[]> {
  if (USE_MOCK) {
    return tenantRequestStore ? [toSummary(tenantRequestStore)] : [];
  }

  const res = await userStore.authFetch(BASE_PATH);
  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) {
    throw new Error('failed to fetch tenant requests');
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(toSummary) : [];
}

export async function getTenantRequestById(id: number | string): Promise<TenantRequestDetail | null> {
  if (USE_MOCK) {
    return tenantRequestStore;
  }

  const res = await userStore.authFetch(`${BASE_PATH}/${id}`);
  if (res.status === 404) return null;
  if (res.status === 401) throw new Error('UNAUTHENTICATED');
  if (!res.ok) {
    throw new Error('failed to fetch tenant request');
  }
  const data = await res.json();
  return toDetail(data);
}

export async function createTenantRequest(
  payload: TenantRequestPayload,
): Promise<{ tenant_request_id: number }> {
  if (USE_MOCK) {
    const id = tenantRequestStore?.id ?? Date.now();
    tenantRequestStore = { id, ...payload };
    return { tenant_request_id: id };
  }

  const res = await userStore.authFetch(BASE_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toServerPayload(payload)),
  });

  if (res.status === 400 || res.status === 401) {
    const err = await res.json();
    throw new Error(err?.detail ?? 'failed to create tenant request');
  }
  if (!res.ok) {
    throw new Error('failed to create tenant request');
  }
  return res.json();
}

export async function updateTenantRequest(
  id: number,
  payload: Partial<TenantRequestPayload>,
): Promise<{ tenant_request_id: number }> {
  if (USE_MOCK) {
    if (!tenantRequestStore) return { tenant_request_id: id };
    tenantRequestStore = { ...tenantRequestStore, ...payload };
    return { tenant_request_id: tenantRequestStore.id };
  }

  const res = await userStore.authFetch(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toServerPayload(payload)),
  });

  if (res.status === 404 || res.status === 401 || res.status === 400) {
    const err = await res.json();
    throw new Error(err?.detail ?? 'failed to update tenant request');
  }
  if (!res.ok) {
    throw new Error('failed to update tenant request');
  }
  return res.json();
}

export async function deleteTenantRequest(id: number): Promise<boolean> {
  if (USE_MOCK) {
    tenantRequestStore = null;
    return true;
  }

  const res = await userStore.authFetch(`${BASE_PATH}/${id}`, { method: 'DELETE' });
  if (res.status === 404) return false;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? 'failed to delete tenant request');
  }
  return true;
}

export async function getTenantContacts(tenantId: string): Promise<ContactRequest[]> {
  return getContactsByTenant(tenantId);
}

export async function updateTenantContactStatus(
  contactId: string,
  status: ContactStatus,
): Promise<ContactRequest | null> {
  return updateContactStatus(contactId, status);
}

export function appendTenantContact(contact: ContactRequest) {
  addContact(contact);
}
