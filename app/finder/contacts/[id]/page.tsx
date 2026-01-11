"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { getSendMessageById, acceptSendMessage, rejectSendMessage } from '@/lib/repositories/finderRepository';
import { SendMessageDetail } from '@/types/contact';

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [contact, setContact] = useState<SendMessageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const data = await getSendMessageById(id);
        if (!data) {
          setError('컨텍 요청을 찾을 수 없습니다.');
        } else {
          setContact(data);
        }
      } catch (err: any) {
        setError(err?.message ?? '컨텍 요청을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContact();
    }
  }, [id]);

  const handleAccept = async () => {
    if (!contact) return;

    try {
      setActionLoading(true);
      await acceptSendMessage(contact.sendMessageId);
      alert('컨텍 요청을 수락했습니다.');
      router.push('/finder/contacts');
    } catch (err: any) {
      alert(err?.message ?? '수락에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!contact) return;

    if (!confirm('컨텍 요청을 거절하시겠습니까? 거절하면 목록에서 제거됩니다.')) {
      return;
    }

    try {
      setActionLoading(true);
      await rejectSendMessage(contact.sendMessageId);
      alert('컨텍 요청을 거절했습니다.');
      router.push('/finder/contacts');
    } catch (err: any) {
      alert(err?.message ?? '거절에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-slate-600">불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error || !contact) {
    return (
      <main className="space-y-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error || '컨텍 요청을 찾을 수 없습니다.'}</p>
        </div>
        <Button onClick={() => router.push('/finder/contacts')}>목록으로</Button>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 via-white to-teal-50 p-8 shadow-sm ring-1 ring-slate-100">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-emerald-700">컨텍 요청 상세</p>
          <h2 className="text-3xl font-bold text-slate-900">
            의뢰서 #{contact.finderRequestId}
          </h2>
          <div className="flex items-center gap-2">
            {contact.acceptType === 'Y' && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                수락함
              </span>
            )}
            {contact.acceptType === 'PENDING' && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                대기중
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 매물 정보 */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏠</span>
            <h3 className="text-lg font-bold text-slate-900">매물 정보</h3>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* 제목 */}
          <div>
            <h4 className="text-xl font-bold text-slate-900">
              {contact.houseTitle || '매물 정보'}
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              {contact.houseAddress || '주소 정보 없음'}
            </p>
          </div>

          {/* 매물 유형 */}
          {contact.houseType && (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {contact.houseType}
              </span>
            </div>
          )}

          {/* 가격 정보 */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  보증금
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {contact.deposit?.toLocaleString() || contact.houseDeposit?.toLocaleString() || '0'}
                  <span className="ml-1 text-sm font-normal text-slate-600">만원</span>
                </p>
              </div>
              {((contact.rent !== undefined && contact.rent > 0) || (contact.houseMonthlyRent !== undefined && contact.houseMonthlyRent > 0)) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    월세
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {contact.rent?.toLocaleString() || contact.houseMonthlyRent?.toLocaleString()}
                    <span className="ml-1 text-sm font-normal text-slate-600">만원</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 매물 상세 정보 (owner_house) */}
          <div className="space-y-3 border-t border-slate-100 pt-6">
            <h5 className="text-sm font-bold text-slate-900">상세 정보</h5>

            <div className="grid gap-3 text-sm">
              {contact.priceType && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 w-24">임대 유형:</span>
                  <span className="text-slate-600">
                    {contact.priceType}
                  </span>
                </div>
              )}

              {contact.isActive !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 w-24">매물 상태:</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    contact.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {contact.isActive ? '활성' : '비활성'}
                  </span>
                </div>
              )}

              {contact.openFrom && contact.openTo && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 w-24">입주 가능:</span>
                  <span className="text-slate-600 text-sm">
                    {new Date(contact.openFrom).toLocaleDateString('ko-KR')} ~ {new Date(contact.openTo).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}

              {contact.address && (
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-slate-700 w-24">상세 주소:</span>
                  <span className="text-slate-600 flex-1">{contact.address}</span>
                </div>
              )}

              {contact.houseCreatedAt && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 w-24">등록일:</span>
                  <span className="text-slate-600 text-sm">
                    {new Date(contact.houseCreatedAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 임대인 메시지 */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <h3 className="text-lg font-bold text-slate-900">임대인 메시지</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {contact.message}
            </p>
          </div>

          {/* 임대인 정보 */}
          {(contact.ownerName || contact.ownerPhone) && (
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              {contact.ownerName && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-slate-700">임대인:</span>
                  <span className="text-slate-600">{contact.ownerName}</span>
                </div>
              )}
              {contact.acceptType === 'Y' && contact.ownerPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-slate-700">연락처:</span>
                  <span className="text-slate-600">{contact.ownerPhone}</span>
                </div>
              )}
              {contact.acceptType === 'PENDING' && contact.ownerPhone && (
                <p className="text-xs text-slate-500">
                  * 수락 후 임대인 연락처를 확인할 수 있습니다.
                </p>
              )}
            </div>
          )}

          {/* 작성일 */}
          <p className="mt-4 text-xs text-slate-500">
            {new Date(contact.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-between gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/finder/contacts')}
          className="rounded-xl px-6 py-3 text-base"
        >
          목록으로
        </Button>

        {contact.acceptType === 'PENDING' && (
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleAccept}
              disabled={actionLoading}
              className="rounded-xl px-6 py-3 text-base"
            >
              {actionLoading ? '처리중...' : '수락'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleReject}
              disabled={actionLoading}
              className="rounded-xl px-6 py-3 text-base bg-red-500 text-white hover:bg-red-600"
            >
              {actionLoading ? '처리중...' : '거절'}
            </Button>
          </div>
        )}

        {contact.acceptType === 'Y' && (
          <div className="rounded-xl bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-700">
            이미 수락한 요청입니다
          </div>
        )}
      </div>
    </main>
  );
}
