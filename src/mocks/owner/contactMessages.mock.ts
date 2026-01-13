import { SendMessage } from '@/types/contact';

export const sentContactMessagesOwnerMock: SendMessage[] = [
  {
    sendMessageId: 101,
    senderId: 1,
    receiverId: 2,
    acceptType: 'W',
    housePlatformId: 301,
    finderRequestId: 1,
    message: '안녕하세요. 요청 주신 조건과 잘 맞는 매물이 있어 연락드립니다.',
    createdAt: '2026-01-06T13:10:00Z',
    updatedAt: '2026-01-06T13:10:00Z',
  },
  {
    sendMessageId: 102,
    senderId: 1,
    receiverId: 2,
    acceptType: 'Y',
    housePlatformId: 302,
    finderRequestId: 2,
    message: '조건에 맞는 매물 안내드립니다. 관심 있으시면 답장 주세요.',
    createdAt: '2026-01-04T09:40:00Z',
    updatedAt: '2026-01-04T09:40:00Z',
  },
];

export const receivedContactMessagesOwnerMock: SendMessage[] = [
  {
    sendMessageId: 104,
    senderId: 20,
    receiverId: 1,
    acceptType: 'W',
    housePlatformId: 401,
    finderRequestId: 3,
    message: '매물 보고 연락드립니다. 방문 상담 가능할까요?',
    createdAt: '2026-01-07T11:50:00Z',
    updatedAt: '2026-01-07T11:50:00Z',
  },
  {
    sendMessageId: 105,
    senderId: 21,
    receiverId: 1,
    acceptType: 'W',
    housePlatformId: 402,
    finderRequestId: 4,
    message: '입주 가능 시기와 보증금 조정 가능 여부 문의드립니다.',
    createdAt: '2026-01-05T15:15:00Z',
    updatedAt: '2026-01-05T15:15:00Z',
  },
];
