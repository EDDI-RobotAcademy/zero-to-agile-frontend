export type SendMessageStatus = 'Y' | 'N' | 'W' | 'PENDING';

export interface SendMessage {
  sendMessageId: number;
  housePlatformId: number;
  finderRequestId: number;
  acceptType: string; // 'Y' | 'N' | 'W' | 'PENDING'
  message: string;
  receiverId: number;
  senderId: number;
  createdAt: string;
  updatedAt: string;
}

export interface AcceptedMessage {
  sendMessageId: number;
  message: string;
  acceptedAt: string;
  targetType: 'HOUSE' | 'REQUEST';
  targetData: any; // 매물 또는 의뢰서 상세 정보
}

export interface SendMessagePayload {
  housePlatformId: number;
  finderRequestId: number;
  message: string;
}

export interface UpdateMessagePayload {
  sendMessageId: number;
  message: string;
}
