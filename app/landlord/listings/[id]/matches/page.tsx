"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import {
  getMatchesForListing,
  sendContactRequest,
} from '@/lib/repositories/landlordRepository';
import { TenantRequestDetail } from '@/types/tenant';

interface MatchItem {
  tenant: TenantRequestDetail;
  matchScore: number;
}

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

export default function LandlordListingMatchesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getMatchesForListing(params.id).then(setMatches);
  }, [params.id]);

  const handleContact = async (tenantId: string) => {
    if (!tenantId) return;
    await sendContactRequest(tenantId, params.id, 'landlord-1');
    setMessage('컨택 요청을 보냈습니다.');
  };

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">매칭된 임차인</h2>
        <Button variant="secondary" onClick={() => router.push(`/landlord/listings/${params.id}`)}>
          매물 상세로 돌아가기
        </Button>
      </div>
      {message && <p className="text-sm text-emerald-600">{message}</p>}
      <div className="space-y-3">
        {matches.map(({ tenant, matchScore }) => (
          <Card
            key={tenant.id}
            title={`${tenant.tenantId} 의뢰서`}
            actions={<span className="text-sm text-gray-600">매칭 점수 {matchScore}</span>}
          >
            <p className="text-sm text-gray-700">
              지역: {tenant.preferredArea} / {RESIDENCE_LABEL[tenant.residenceType] ?? tenant.residenceType} /{' '}
              {DEAL_LABEL[tenant.dealType] ?? tenant.dealType}
            </p>
            <p className="text-sm text-gray-700">
              예산 ({tenant.dealType === 'sale' ? '매매가' : '보증금'}) {tenant.budget.toLocaleString()} 만원 · 면적 {tenant.area} m² 이상
            </p>
            <Button className="mt-3" onClick={() => handleContact(tenant.tenantId ?? '')}>
              컨텍하기
            </Button>
          </Card>
        ))}
      </div>
    </main>
  );
}
