"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getReceivedMessages,
  updateMessageStatus,
  deleteMessage
} from '@/lib/repositories/contactRepository';
import { SendMessage } from '@/types/contact';

export default function OwnerReceivedContactsPage() {
  const [contacts, setContacts] = useState<SendMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await getReceivedMessages();
      setContacts(data);
    } catch (err: any) {
      setError(err?.message ?? '내가 받은 컨텍 요청 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    sendMessageId: number,
    acceptType: 'Y' | 'N'
  ) => {
    try {
      setProcessingId(sendMessageId);
      await updateMessageStatus(sendMessageId, acceptType);
      await fetchContacts();
    } catch (err: any) {
      alert(
        err?.message ??
          (acceptType === 'Y'
            ? '컨텍 요청 수락에 실패했습니다.'
            : '컨텍 요청 거절에 실패했습니다.')
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    try {
      await deleteMessage(deleteTargetId); 
      // 성공 시 로컬 상태 반영
      setContacts(prev =>
        prev.filter(c => c.sendMessageId !== deleteTargetId)
      );
    } catch (err: any) {
      alert(err?.message ?? '메시지 삭제에 실패했습니다.');
    } finally {
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
  };

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
            수락함
          </span>
        );
      case 'N':
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            거절함
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-50 px-8 py-8 shadow-lg ring-1 ring-purple-100">
        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="rounded-lg bg-purple-600 p-1.5">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Received</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">내가 받은 컨텍 요청</h1>
          <p className="text-sm text-slate-600">
            임차인이 보낸 컨텍 요청을 확인하고 관리하세요
          </p>
        </div>
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-200/30 blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-pink-200/30 blur-2xl"></div>
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
              <p className="text-6xl">📥</p>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">받은 컨텍 요청이 없습니다</h3>
            <p className="text-sm text-slate-500">
              임차인이 매물에 관심을 보이면 여기에서 확인할 수 있어요
            </p>
          </div>
        </div>
      )}

      {/* 컨택 목록 */}
      <div className="space-y-4">
        {contacts.map((contact) => (
          <div
            key={contact.sendMessageId}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200 transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-purple-300"
          >
            {/* 삭제 버튼 (오른쪽 상단) */}
            <button
              onClick={() => handleDeleteClick(contact.sendMessageId)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
              aria-label="삭제"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              {/* 상단: 상태 배지 */}
              <div className="mb-4">
                {getStatusBadge(contact.acceptType)}
              </div>

              {/* 매물 제목 */}
              <div className="mb-4 flex items-start gap-3">
                <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 p-2.5 shadow-sm">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="flex-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-purple-700">
                  매물 #{contact.housePlatformId}
                </h3>
              </div>

              {/* 임차인 메시지 */}
              <div className="relative mb-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 shadow-sm">
                <div className="absolute -left-1.5 top-3 h-3 w-3 rotate-45 bg-gradient-to-br from-purple-50 to-pink-50"></div>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="text-xs font-bold text-purple-700">임차인 메시지</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  {contact.message}
                </p>
              </div>

              {/* 하단: 버튼 그룹 + 날짜 */}
              <div className="flex flex-wrap items-end justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  {contact.acceptType === 'W' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(contact.sendMessageId, 'Y')}
                        disabled={processingId === contact.sendMessageId}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:translate-y-0 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-sm"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {processingId === contact.sendMessageId ? '처리중...' : '수락'}
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(contact.sendMessageId, 'N')}
                        disabled={processingId === contact.sendMessageId}
                        className="inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {processingId === contact.sendMessageId ? '처리중...' : '거절'}
                      </button>
                    </>
                  )}
                  <Link
                    href={`/owner/listings/${contact.housePlatformId}`}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-emerald-600 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    내 매물
                  </Link>
                  <Link
                    href={`/owner/finder-request/${contact.finderRequestId}?acceptType=${contact.acceptType}`}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    의뢰서 보기
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

      {/* 삭제 확인 모달 */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">컨텍 요청 삭제</h3>
            </div>
            <p className="mb-6 text-sm text-slate-600">
              정말 이 컨텍 요청을 삭제하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
