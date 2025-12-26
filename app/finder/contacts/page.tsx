"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
// import { Card } from '@/components/common/Card';
// import { getListingById } from '@/lib/repositories/listingRepository';
// import {
//   getFinderContacts,
//   updateFinderContactStatus,
// } from '@/lib/repositories/finderRepository';
// import { ContactRequest } from '@/types/contact';
// import { Listing } from '@/types/listing';

export default function FinderContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [listingMap, setListingMap] = useState<Record<string, Listing | null>>({});

  // API 준비 전 임시 주석 처리
  // useEffect(() => {
  //   (async () => {
  //     // @ts-ignore
  //     const data = await new getFinderContacts('finder-1');
  //     setContacts(data);
  //     const entries = await Promise.all(
  //       data.map(async (contact: { listingId: string; }) => [contact.listingId, await getListingById(contact.listingId)]),
  //     );
  //     const map = Object.fromEntries(entries) as Record<string, Listing | null>;
  //     setListingMap(map);
  //   })();
  // }, []);

  // const handleStatus = async (id: string, status: ContactRequest['status']) => {
  //   await updateFinderContactStatus(id, status);
  //   setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  // };

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-slate-600">컨택 목록을 불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 via-white to-teal-50 p-8 shadow-sm ring-1 ring-slate-100">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-emerald-700">나에게 제안한</p>
          <h2 className="text-3xl font-bold text-slate-900">임대인 컨택</h2>
          <p className="text-sm text-slate-600">
            임대인의 매물 제안을 확인하고 관리하세요
          </p>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 컨택 비어있음 */}
      {!error && contacts.length === 0 && (
        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl bg-slate-50 p-12">
          <div className="text-center">
            <p className="text-5xl">💼</p>
            <p className="mt-4 text-lg font-semibold text-slate-700">아직 컨택한 임대인이 없습니다</p>
            <p className="mt-2 text-sm text-slate-500">
              임대인이 매물을 제안하면 여기에서 확인할 수 있어요
            </p>
          </div>
        </div>
      )}

      {/* 컨택 목록 */}
      <div className="space-y-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 transition hover:shadow-2xl"
          >
            <div className="p-6">
              {/* 나중에 API 연결 시 사용할 코드 */}
            </div>
          </div>
        ))}
      </div>
    </main>
  );

  // 기존 코드 (API 연결 후 사용)
  // return (
  //   <main className="space-y-4">
  //     <h2 className="text-2xl font-bold">나에게 컨택한 임대인</h2>
  //     <div className="space-y-3">
  //       {contacts.map((contact) => {
  //         const listing = listingMap[contact.listingId];
  //         return (
  //           <Card
  //             key={contact.id}
  //             title={listing?.title ?? `매물 ID ${contact.listingId}`}
  //             actions={<span className="text-sm text-gray-600">상태: {contact.status}</span>}
  //           >
  //             <p className="text-sm text-gray-700">
  //               임대인 닉네임: {contact.ownerId} / 제안 매물: {listing?.district ?? '미상'}
  //             </p>
  //             {contact.status === 'pending' ? (
  //               <div className="mt-3 flex gap-2">
  //                 <Button onClick={() => handleStatus(contact.id, 'accepted')}>수락</Button>
  //                 <Button
  //                   variant="secondary"
  //                   onClick={() => handleStatus(contact.id, 'rejected')}
  //                 >
  //                   거절
  //                 </Button>
  //               </div>
  //             ) : (
  //               <p className="mt-2 text-sm text-gray-600">
  //                 {contact.status === 'accepted'
  //                   ? '수락되었습니다. 임대인 측에서 연락처를 확인할 수 있습니다.'
  //                   : '거절된 요청입니다.'}
  //               </p>
  //             )}
  //           </Card>
  //         );
  //       })}
  //     </div>
  //   </main>
  // );
}
