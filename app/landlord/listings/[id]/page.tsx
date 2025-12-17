"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { getLandlordListingDetail } from '@/lib/repositories/landlordRepository';
import { Listing } from '@/types/listing';

export default function LandlordListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    getLandlordListingDetail(params.id).then(setListing);
  }, [params.id]);

  if (!listing) {
    return (
      <main className="space-y-4">
        <p className="text-gray-600">매물 정보를 불러오는 중입니다...</p>
        <Button variant="secondary" onClick={() => router.push('/landlord/listings')}>
          목록으로 돌아가기
        </Button>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{listing.title}</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push('/landlord/listings')}>
            목록으로 돌아가기
          </Button>
          <Button onClick={() => router.push(`/landlord/listings/${listing.id}/matches`)}>
            매칭된 임차인 보기
          </Button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {listing.images.map((img) => (
          <img key={img} src={img} alt={listing.title} className="h-52 w-full rounded object-cover" />
        ))}
      </div>
      <Card title="기본 정보" actions={null}>
        <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-2">
          <p>계약 형태: {listing.contractType}</p>
          <p>가격: {listing.price.toLocaleString()} 만원</p>
          <p>면적: {listing.area} m²</p>
          <p>방/욕실: {listing.rooms} / {listing.bathrooms}</p>
          <p>옵션: {listing.options?.join(', ') || '-'}</p>
          <p>상태: {listing.status ?? 'active'}</p>
        </div>
      </Card>
      <Card title="설명" actions={null}>
        <p className="text-gray-700">{listing.description}</p>
      </Card>
    </main>
  );
}
