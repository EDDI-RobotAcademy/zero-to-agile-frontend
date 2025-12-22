"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { getLandlordListings } from '@/lib/repositories/landlordRepository';
import { Listing } from '@/types/listing';

export default function LandlordListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    getLandlordListings('landlord-1').then(setListings);
  }, []);

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">내 매물 목록</h2>
        <Button onClick={() => router.push('/landlord/listings/new')}>매물 등록</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {listings.map((listing) => (
          <Card
            key={listing.id}
            title={listing.title}
            actions={<span className="text-sm text-gray-600">{listing.status ?? 'active'}</span>}
          >
            <p className="text-sm text-gray-700">
              {listing.district} · {listing.contractType === 'jeonse' ? '전세' : '매매'}{' '}
              {listing.price.toLocaleString()} 만원
            </p>
            <p className="text-sm text-gray-700">
              등록일: {new Date(listing.createdAt).toLocaleDateString('ko-KR')}
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" onClick={() => router.push(`/landlord/listings/${listing.id}`)}>
                상세보기
              </Button>
              <Button onClick={() => router.push(`/landlord/listings/${listing.id}/matches`)}>
                매칭된 임차인 보기
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
