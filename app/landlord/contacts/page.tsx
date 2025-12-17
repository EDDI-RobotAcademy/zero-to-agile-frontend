"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { getListingById } from '@/lib/repositories/listingRepository';
import { getLandlordContacts } from '@/lib/repositories/landlordRepository';
import { ContactRequest } from '@/types/contact';
import { Listing } from '@/types/listing';

export default function LandlordContactsPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [listingMap, setListingMap] = useState<Record<string, Listing | null>>({});

  useEffect(() => {
    (async () => {
      const data = await getLandlordContacts('landlord-1');
      setContacts(data);
      const entries = await Promise.all(
        data.map(async (contact) => [contact.listingId, await getListingById(contact.listingId)]),
      );
      setListingMap(Object.fromEntries(entries) as Record<string, Listing | null>);
    })();
  }, []);

  return (
    <main className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-sm ring-1 ring-slate-100">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-emerald-700">컨택</p>
          <h2 className="text-3xl font-bold text-slate-900">내가 보낸 컨택 요청</h2>
          <p className="text-sm text-slate-600">요청 상태와 임차인 정보를 빠르게 확인하세요.</p>
        </div>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => {
          const listing = listingMap[contact.listingId];
          const statusTone =
            contact.status === 'accepted'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
              : contact.status === 'pending'
                ? 'bg-amber-50 text-amber-800 border-amber-100'
                : 'bg-slate-100 text-slate-700 border-slate-200';
          return (
            <Card
              key={contact.id}
              title={listing?.title ?? '알 수 없는 매물'}
              actions={
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone}`}>
                  상태: {contact.status}
                </span>
              }
            >
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                  임차인 {contact.tenantId}
                </span>
                <span className="text-slate-500">
                  요청일 {new Date(contact.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              {contact.status === 'accepted' && (
                <p className="mt-2 text-sm font-semibold text-emerald-700">
                  임차인 연락처: {contact.tenantPhone ?? '제공됨'}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <Button
                  className="rounded-xl px-4 py-2 text-sm"
                  variant="secondary"
                  onClick={() => (window.location.href = `/landlord/tenants/${contact.tenantId}`)}
                >
                  의뢰서 다시 보기
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
