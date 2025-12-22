"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { getListingById } from '@/lib/repositories/listingRepository';
import {
  getTenantContacts,
  updateTenantContactStatus,
} from '@/lib/repositories/tenantRepository';
import { ContactRequest } from '@/types/contact';
import { Listing } from '@/types/listing';

export default function TenantContactsPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [listingMap, setListingMap] = useState<Record<string, Listing | null>>({});

  useEffect(() => {
    (async () => {
      const data = await getTenantContacts('tenant-1');
      setContacts(data);
      const entries = await Promise.all(
        data.map(async (contact) => [contact.listingId, await getListingById(contact.listingId)]),
      );
      const map = Object.fromEntries(entries) as Record<string, Listing | null>;
      setListingMap(map);
    })();
  }, []);

  const handleStatus = async (id: string, status: ContactRequest['status']) => {
    await updateTenantContactStatus(id, status);
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-bold">나에게 컨택한 임대인</h2>
      <div className="space-y-3">
        {contacts.map((contact) => {
          const listing = listingMap[contact.listingId];
          return (
            <Card
              key={contact.id}
              title={listing?.title ?? `매물 ID ${contact.listingId}`}
              actions={<span className="text-sm text-gray-600">상태: {contact.status}</span>}
            >
              <p className="text-sm text-gray-700">
                임대인 닉네임: {contact.landlordId} / 제안 매물: {listing?.district ?? '미상'}
              </p>
              {contact.status === 'pending' ? (
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => handleStatus(contact.id, 'accepted')}>수락</Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleStatus(contact.id, 'rejected')}
                  >
                    거절
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-600">
                  {contact.status === 'accepted'
                    ? '수락되었습니다. 임대인 측에서 연락처를 확인할 수 있습니다.'
                    : '거절된 요청입니다.'}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </main>
  );
}
