"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { getListingById } from '@/lib/repositories/listingRepository';
import { Listing } from '@/types/listing';

type PageProps = { params: Promise<{ id: string }> };

export default function TenantListingDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [listingId, setListingId] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    let active = true;
    Promise.resolve(params).then(({ id }) => {
      if (!active) return;
      setListingId(id);
      getListingById(id).then((data) => {
        if (active) setListing(data);
      });
    });
    return () => {
      active = false;
    };
  }, [params]);

  if (!listing) {
    return (
      <main className="space-y-4">
        <p className="text-gray-600">매물을 불러오는 중입니다...</p>
        <Button variant="secondary" onClick={() => router.push('/tenant/listings')}>
          목록으로 돌아가기
        </Button>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{listing.title}</h2>
          <p className="text-sm text-gray-600">
            {listing.region} {listing.district} · {listing.type} ·{' '}
            {listing.contractType === 'jeonse' ? '전세' : '매매'}
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/tenant/listings')}>
          목록으로 돌아가기
        </Button>
      </div>
      <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-2">
        {listing.images.map((img) => (
          <img key={img} src={img} alt={listing.title} className="h-52 w-full rounded object-cover" />
        ))}
      </div>
      <Card title="기본 정보" actions={null}>
        <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-2">
          <p>가격: {listing.price.toLocaleString()} 만원</p>
          <p>면적: {listing.area} m²</p>
          <p>
            방/욕실: {listing.rooms} / {listing.bathrooms}
          </p>
          <p>층수: {listing.floor}층</p>
          <p>옵션: {listing.options?.join(', ') || '-'}</p>
        </div>
      </Card>
      <Card title="상세 설명" actions={null}>
        <p className="text-gray-700">{listing.description}</p>
      </Card>
      <Card title="AI가 생성한 집 소개 문구" actions={null}>
        <p className="text-gray-700">{listing.aiDescription ?? '생성된 설명이 없습니다.'}</p>
      </Card>
    </main>
  );
}
