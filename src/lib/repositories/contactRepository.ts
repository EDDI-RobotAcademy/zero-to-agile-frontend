import {
  SendMessage,
  AcceptedMessage,
  SendMessagePayload,
  UpdateMessagePayload
} from '@/types/contact';
import { userStore } from '@/lib/auth/userStore';
import { USE_MOCK } from '@/config/env';
import {
  sentContactMessagesFinderMock,
  receivedContactMessagesFinderMock,
  acceptedContactMessagesMock,
} from '@/mocks/finder/contactMessages.mock';

/**
 * ======================================================
 * 컨텍 메시지 관리 API
 * ======================================================
 */

/**
 * 내가 보낸 컨텍 메시지 목록 조회
 * GET /messages/sent
 */
export async function getSentMessages(): Promise<SendMessage[]> {
  if (USE_MOCK) {
    return sentContactMessagesFinderMock;
  }

  const res = await userStore.authFetch('/messages/sent');

  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (!res.ok) throw new Error("FAILED_TO_FETCH_SENT_MESSAGES");

  const data = await res.json();
  return Array.isArray(data) ? data.map(toSendMessage) : [];
}

/**
 * 내가 받은 컨텍 메시지 목록 조회
 * GET /messages/received
 */
export async function getReceivedMessages(): Promise<SendMessage[]> {
  if (USE_MOCK) {
    return receivedContactMessagesFinderMock;
  }

  const res = await userStore.authFetch('/messages/received');

  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (!res.ok) throw new Error("FAILED_TO_FETCH_RECEIVED_MESSAGES");

  const data = await res.json();
  return Array.isArray(data) ? data.map(toSendMessage) : [];
}

/**
 * 컨텍 메시지 수락
 * @deprecated updateMessageStatus 사용 권장
 */
export async function acceptMessage(sendMessageId: number): Promise<boolean> {
  return updateMessageStatus(sendMessageId, 'Y');
}

/**
 * 컨텍 메시지 거절
 * @deprecated updateMessageStatus 사용 권장
 */
export async function rejectMessage(sendMessageId: number): Promise<boolean> {
  return updateMessageStatus(sendMessageId, 'N');
}

/**
 * 메시지 전송
 * POST /messages
 */
export async function sendMessage(payload: SendMessagePayload): Promise<SendMessage> {
  if (USE_MOCK) {
    // TODO: mock 처리
    return {
      sendMessageId: Date.now(),
      housePlatformId: payload.housePlatformId,
      finderRequestId: payload.finderRequestId,
      acceptType: 'PENDING',
      message: payload.message,
      receiverId: 0,
      senderId: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const res = await userStore.authFetch('/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      house_platform_id: payload.housePlatformId,
      finder_request_id: payload.finderRequestId,
      message: payload.message,
    }),
  });

  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (!res.ok) throw new Error("FAILED_TO_SEND_MESSAGE");

  const data = await res.json();
  return toSendMessage(data);
}

/**
 * 메시지 내용 수정
 * PUT /messages/content
 */
export async function updateMessageContent(payload: UpdateMessagePayload): Promise<boolean> {
  if (USE_MOCK) {
    // TODO: mock 처리
    return true;
  }

  const res = await userStore.authFetch('/messages/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      send_message_id: payload.sendMessageId,
      message: payload.message,
    }),
  });

  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (!res.ok) throw new Error("FAILED_TO_UPDATE_MESSAGE");

  return true;
}

/**
 * 내가 수락한 제안 목록 조회
 * GET /messages/accepted
 */
export async function getAcceptedMessages(): Promise<AcceptedMessage[]> {
  if (USE_MOCK) {
    return acceptedContactMessagesMock;
  }

  const res = await userStore.authFetch('/messages/accepted');

  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (!res.ok) throw new Error("FAILED_TO_FETCH_ACCEPTED_MESSAGES");

  const data = await res.json();
  return Array.isArray(data) ? data.map(toAcceptedMessage) : [];
}

/**
 * 제안 수락/거절 상태 변경
 * PUT /messages/status
 */
export async function updateMessageStatus(
  sendMessageId: number,
  acceptType: 'Y' | 'N' | 'W'
): Promise<boolean> {
  if (USE_MOCK) {
    return true;
  }

  const res = await userStore.authFetch('/messages/status', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      send_message_id: sendMessageId,
      accept_type: acceptType,
    }),
  });

  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (!res.ok) throw new Error("FAILED_TO_UPDATE_MESSAGE_STATUS");

  return true;
}

/**
 * 받은 제안 삭제 (Soft Delete)
 * DELETE /messages/{send_message_id}
 */
export async function deleteMessage(sendMessageId: number): Promise<boolean> {
  if (USE_MOCK) {
    return true;
  }

  const res = await userStore.authFetch(`/messages/${sendMessageId}`, {
    method: 'DELETE',
  });

  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (!res.ok) throw new Error("FAILED_TO_DELETE_MESSAGE");

  return true;
}

/**
 * ======================================================
 * Mapper (server → frontend)
 * ======================================================
 */
function toSendMessage(data: any): SendMessage {
  return {
    sendMessageId: data.send_message_id ?? data.sendMessageId,
    housePlatformId: data.house_platform_id ?? data.housePlatformId ?? 0,
    finderRequestId: data.finder_request_id ?? data.finderRequestId ?? 0,
    acceptType: data.accept_type ?? data.acceptType ?? 'PENDING',
    message: data.message ?? '',
    receiverId: data.receiver_id ?? data.receiverId ?? 0,
    senderId: data.sender_id ?? data.senderId ?? 0,
    createdAt: data.created_at ?? data.createdAt ?? '',
    updatedAt: data.updated_at ?? data.updatedAt ?? '',
  };
}

function toAcceptedMessage(data: any): AcceptedMessage {
  return {
    sendMessageId: data.send_message_id ?? data.sendMessageId,
    message: data.message ?? '',
    acceptedAt: data.accepted_at ?? data.acceptedAt ?? '',
    targetType: data.target_type ?? data.targetType ?? 'HOUSE',
    targetData: data.target_data ?? data.targetData ?? {},
  };
}
