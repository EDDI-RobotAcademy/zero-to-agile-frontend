"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { getLandlordContacts, getLandlordListings } from '@/lib/repositories/landlordRepository';
import { Listing } from '@/types/listing';
import { ContactRequest } from '@/types/contact';

export default function LandlordHomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getLandlordListings('landlord-1');
      setListings(data);
      const contactData = await getLandlordContacts('landlord-1');
      setContacts(contactData);
    })();
  }, []);

  const pendingContacts = contacts.filter((c) => c.status === 'pending').length;

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">임대인 홈</p>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">매물과 컨택을 한 번에</h2>
            <p className="text-sm text-slate-600">등록된 매물과 컨택 요청을 빠르게 확인하세요.</p>
          </div>
          <div className="flex gap-2">
            <Link
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
              href="/landlord/listings/new"
            >
              매물 등록하기
            </Link>
            <Link
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
              href="/landlord/contacts"
            >
              컨택 요청
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          title="매물 현황"
          actions={<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">전체</span>}
        >
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-slate-900">{listings.length}개</p>
            <span className="text-xs text-slate-500">등록된 매물</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="rounded-xl px-5 py-2.5" onClick={() => (window.location.href = '/landlord/listings/new')}>
              매물 등록하기
            </Button>
            <Button
              className="rounded-xl px-5 py-2.5"
              variant="secondary"
              onClick={() => (window.location.href = '/landlord/listings')}
            >
              내 매물 목록 보기
            </Button>
          </div>
        </Card>
        <Card
          title="컨택 요청"
          actions={<span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">대기</span>}
        >
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-slate-900">{pendingContacts}건</p>
            <span className="text-xs text-slate-500">응답 필요</span>
          </div>
          <Button className="mt-4 w-full rounded-xl py-3" onClick={() => (window.location.href = '/landlord/contacts')}>
            컨택 요청 현황 보기
          </Button>
        </Card>
      </div>

      <Card title="빠른 이동" actions={null}>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <Link className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-800 transition hover:-translate-y-0.5 hover:border-emerald-200" href="/landlord/listings/new">
            매물 등록하기
          </Link>
          <Link className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-800 transition hover:-translate-y-0.5 hover:border-emerald-200" href="/landlord/listings">
            내 매물 목록 보기
          </Link>
          <Link className="rounded-full border border-sky-100 bg-sky-50 px-3 py-2 text-sky-800 transition hover:-translate-y-0.5 hover:border-sky-200" href="/landlord/contacts">
            컨택 요청 보기
          </Link>
        </div>
      </Card>
    </main>
  );
}
