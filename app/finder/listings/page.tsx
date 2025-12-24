"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { listRecommendedListings } from '@/lib/repositories/listingRepository';
import { getFinderRequestById, listFinderRequests } from '@/lib/repositories/finderRepository';
import { Listing } from '@/types/listing';
import { FinderRequestDetail } from '@/types/finder';

const RESIDENCE_LABEL: Record<string, string> = {
  apartment: '아파트',
  officetel: '오피스텔',
  villa: '빌라',
  house: '단독주택',
  commercial: '상가',
};

const DEAL_LABEL: Record<string, string> = {
  jeonse: '전세',
  sale: '매매',
  monthly: '월세',
};

export default function FinderListingsPage() {
  const router = useRouter();
  const [request, setRequest] = useState<FinderRequestDetail | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const summaries = await listFinderRequests();
        if (summaries.length) {
          const targetId = summaries[0]?.id ?? summaries[0]?.finderRequestId;
          if (targetId !== undefined) {
            const detail = await getFinderRequestById(targetId);
            setRequest(detail);
            const rec = await listRecommendedListings(detail ?? undefined);
            setListings(rec);
            return;
          }
        }
        const rec = await listRecommendedListings(undefined);
        setListings(rec);
      } catch (err: any) {
        if (err?.message === 'UNAUTHENTICATED') {
          router.replace('/auth/role-select');
          return;
        }
        setError(err?.message ?? '추천 매물을 불러오지 못했습니다.');
      }
    })();
  }, [router]);

  const sortByPrice = () => {
    setListings((prev) => [...prev].sort((a, b) => a.price - b.price));
  };

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">추천 매물</h2>
          {request ? (
            <p className="text-sm text-gray-600">
              {request.preferredArea} ·{' '}
              {request.residenceType
                  ? (RESIDENCE_LABEL[request.residenceType] ?? request.residenceType)
                  : '-'} ·{' '}
              {request.dealType
                  ? (DEAL_LABEL[request.dealType] ?? request.dealType)
                  : '-'}
            </p>
          ) : (
            <p className="text-sm text-gray-600">의뢰서 없이 기본 추천이 표시됩니다.</p>
          )}
        </div>
        <Button variant="secondary" onClick={sortByPrice}>
          가격 오름차순
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {listings.map((listing) => (
          <Card
            key={listing.id}
            title={listing.title}
            actions={
              <Button onClick={() => router.push(`/finder/listings/${listing.id}`)}>상세보기</Button>
            }
          >
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="mb-3 h-40 w-full rounded-md object-cover"
            />
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                {listing.district} · {RESIDENCE_LABEL[listing.type] ?? listing.type}
              </p>
              <p>
                {DEAL_LABEL[listing.contractType] ?? listing.contractType}{' '}
                {listing.price.toLocaleString()} 만원
              </p>
              <p>
                {listing.area}m² · 방 {listing.rooms} · 욕실 {listing.bathrooms}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
