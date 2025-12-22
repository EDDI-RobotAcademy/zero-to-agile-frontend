export interface FinderProfile {
  id: string;
  nickname: string;
  phone?: string;
}

export interface FinderRequestSummary {
  id: number;
  preferredArea: string;
  residenceType: string;
  dealType: string;
  budget: number;
}

export interface FinderRequestDetail extends FinderRequestSummary {
  finderId?: string;
  area: number;
  roomCount: number;
  bathroomCount: number;
}

export type FinderRequestPayload = Omit<FinderRequestDetail, 'id' | 'finderId'>;
