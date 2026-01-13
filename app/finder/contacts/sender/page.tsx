"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSentMessages } from '@/lib/repositories/contactRepository';
import { SendMessage } from '@/types/contact';

export default function SentContactsPage() {
  const [contacts, setContacts] = useState<SendMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const data = await getSentMessages();
        console.log('[Sender] Fetched contacts:', data);
        setContacts(data);
      } catch (err: any) {
        setError(err?.message ?? '내가 보낸 컨텍 요청 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);


  if (loading) {
    return (
      <main className="space-y-6">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-slate-600">컨텍 목록을 불러오는 중...</p>
        </div>
      </main>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Y':
        return (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            수락됨
          </span>
        );
      case 'N':
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            거절됨
          </span>
        );
      case 'W':
        return (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            대기중
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium tracking-tight text-blue-500 ml-0.5">
              보낸 컨텍
            </p>
            <h2 className="text-[26px] font-semibold tracking-[-0.015em] mb-1 text-slate-900">
              내가 보낸 컨텍 요청
            </h2>
            <p className="text-sm tracking-[-0.005em] leading-relaxed text-slate-500">
              임대인에게 보낸 컨텍 요청을 확인하고 관리하세요
            </p>
          </div>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* 컨택 비어있음 */}
      {!error && contacts.length === 0 && (
        <div className="flex min-h-[45vh] items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-12 shadow-inner">
          <div className="text-center">
            <div className="mb-5 inline-block rounded-full bg-white p-6 shadow-md">
              <p className="text-6xl">📤</p>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">보낸 컨텍 요청이 없습니다</h3>
            <p className="text-sm text-slate-500">
              마음에 드는 매물에 컨텍 요청을 보내보세요
            </p>
          </div>
        </div>
      )}

      {/* 컨택 목록 */}
      <div className="space-y-4">
        {contacts.map((contact) => (
          <div
            key={contact.sendMessageId}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200 transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-blue-300"
          >
            <div className="p-6">
              {/* 상단: 상태 배지 */}
              <div className="mb-4">
                {getStatusBadge(contact.acceptType)}
              </div>

              {/* 매물 제목 */}
              <div className="mb-4 flex items-start gap-3">
                <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 p-2.5 shadow-sm">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="flex-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                  매물 #{contact.housePlatformId}
                </h3>
              </div>

              {/* 내가 보낸 메시지 */}
              <div className="relative mb-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm">
                <div className="absolute -left-1.5 top-3 h-3 w-3 rotate-45 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="text-xs font-bold text-blue-700">내가 보낸 메시지</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  {contact.message}
                </p>
              </div>

              {/* 하단: 버튼 + 날짜 */}
              <div className="flex flex-wrap items-end justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href={`/finder/house/${contact.housePlatformId}?acceptType=${contact.acceptType}`}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:bg-blue-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    매물 보기
                  </Link>
                  <Link
                    href={`/finder/request/${contact.finderRequestId}`}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    내 의뢰서
                  </Link>
                </div>

                {/* 날짜 (오른쪽 하단) */}
                <time className="text-xs text-slate-400">
                  {new Date(contact.createdAt).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
