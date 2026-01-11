import { SendMessage, AcceptedMessage } from '@/types/contact';

export const sentContactMessagesFinderMock: SendMessage[] = [
  {
    sendMessageId: 1,
    senderId: 10,
    receiverId: 20,
    acceptType: 'W',
    housePlatformId: 101,
    finderRequestId: 1,
    message: '안녕하세요! 이 매물에 관심이 많습니다. 견학 가능할까요?',
    createdAt: '2026-01-05T10:30:00Z',
    updatedAt: '2026-01-05T10:30:00Z',
  },
  {
    sendMessageId: 2,
    senderId: 10,
    receiverId: 21,
    acceptType: 'Y',
    housePlatformId: 102,
    finderRequestId: 1,
    message: '매물이 마음에 듭니다. 계약 진행하고 싶습니다.',
    createdAt: '2026-01-03T14:20:00Z',
    updatedAt: '2026-01-03T14:20:00Z',
  },
  {
    sendMessageId: 3,
    senderId: 10,
    receiverId: 22,
    acceptType: 'N',
    housePlatformId: 103,
    finderRequestId: 1,
    message: '주차 가능 여부 문의드립니다.',
    createdAt: '2026-01-01T09:15:00Z',
    updatedAt: '2026-01-01T09:15:00Z',
  },
];

export const receivedContactMessagesFinderMock: SendMessage[] = [
  {
    sendMessageId: 4,
    senderId: 30,
    receiverId: 10,
    acceptType: 'W',
    housePlatformId: 201,
    finderRequestId: 1,
    message: '귀하의 의뢰서를 보고 연락드립니다. 제 매물이 조건에 맞을 것 같습니다.',
    createdAt: '2026-01-06T16:45:00Z',
    updatedAt: '2026-01-06T16:45:00Z',
  },
  {
    sendMessageId: 5,
    senderId: 31,
    receiverId: 10,
    acceptType: 'W',
    housePlatformId: 202,
    finderRequestId: 1,
    message: '좋은 조건의 매물입니다. 연락 주시면 상담 도와드리겠습니다.',
    createdAt: '2026-01-04T11:30:00Z',
    updatedAt: '2026-01-04T11:30:00Z',
  },
];

export const acceptedContactMessagesMock: AcceptedMessage[] = [
  {
    sendMessageId: 2,
    message: '매물이 마음에 듭니다. 계약 진행하고 싶습니다.',
    acceptedAt: '2026-01-03T15:00:00Z',
    targetType: 'HOUSE',
    targetData: {
      housePlatformId: 102,
      address: '서울시 마포구 상수동',
      priceType: '월세',
      deposit: 5000,
      rent: 50,
    },
  },
];
