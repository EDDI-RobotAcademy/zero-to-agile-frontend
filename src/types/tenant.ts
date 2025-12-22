export interface TenantProfile {
  id: string;
  nickname: string;
  phone?: string;
}

export interface TenantRequestSummary {
  id: number;
  preferredArea: string;
  residenceType: string;
  dealType: string;
  budget: number;
}

export interface TenantRequestDetail extends TenantRequestSummary {
  tenantId?: string;
  area: number;
  roomCount: number;
  bathroomCount: number;
}

export type TenantRequestPayload = Omit<TenantRequestDetail, 'id' | 'tenantId'>;
