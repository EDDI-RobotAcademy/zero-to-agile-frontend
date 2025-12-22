"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { getTenantRequestById } from '@/lib/repositories/tenantRepository';
import { sendContactRequest } from '@/lib/repositories/landlordRepository';
import { TenantRequestDetail } from '@/types/tenant';

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

type PageProps = { params: Promise<{ id: string }> };

export default function LandlordTenantDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantRequest, setTenantRequest] = useState<TenantRequestDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.resolve(params).then(({ id }) => {
      if (!active) return;
      setTenantId(id);
      getTenantRequestById(id).then((data) => {
        if (active) setTenantRequest(data);
      });
    });
    return () => {
      active = false;
    };
  }, [params]);

  const handleContact = async () => {
    if (!tenantRequest?.tenantId || !tenantId) return;
    await sendContactRequest(tenantRequest.tenantId, 'listing-1', 'landlord-1');
    setMessage('컨택 요청을 보냈습니다.');
  };

  if (!tenantRequest) {
    return (
      <main className="space-y-4">
        <p className="text-gray-600">임차인 정보를 찾을 수 없습니다.</p>
        <Button variant="secondary" onClick={() => router.back()}>
          돌아가기
        </Button>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">임차인 의뢰서 상세</h2>
        <Button variant="secondary" onClick={() => router.back()}>
          뒤로가기
        </Button>
      </div>
      {message && <p className="text-sm text-emerald-600">{message}</p>}
      <Card title={`임차인 ${tenantRequest.tenantId}`} actions={null}>
        <dl className="grid grid-cols-2 gap-3 text-sm text-gray-700">
          <div>
            <dt className="font-semibold">지역</dt>
            <dd>{tenantRequest.preferredArea}</dd>
          </div>
          <div>
            <dt className="font-semibold">매물 종류</dt>
            <dd>{RESIDENCE_LABEL[tenantRequest.residenceType] ?? tenantRequest.residenceType}</dd>
          </div>
          <div>
            <dt className="font-semibold">계약 형태</dt>
            <dd>{DEAL_LABEL[tenantRequest.dealType] ?? tenantRequest.dealType}</dd>
          </div>
          <div>
            <dt className="font-semibold">
              예산 ({tenantRequest.dealType === 'sale' ? '매매가' : '보증금'})
            </dt>
            <dd>{tenantRequest.budget.toLocaleString()} 만원</dd>
          </div>
          <div>
            <dt className="font-semibold">면적</dt>
            <dd>{tenantRequest.area} m² 이상</dd>
          </div>
          <div>
            <dt className="font-semibold">방/욕실</dt>
            <dd>
              {tenantRequest.roomCount} / {tenantRequest.bathroomCount}
            </dd>
        </div>
        <div className="col-span-2">
          <dt className="font-semibold">입주 가능 시기</dt>
          <dd>-</dd>
        </div>
        <div className="col-span-2">
          <dt className="font-semibold">기타 요청사항</dt>
          <dd>-</dd>
        </div>
        </dl>
        <Button className="mt-4" onClick={handleContact}>
          컨텍하기
        </Button>
      </Card>
    </main>
  );
}
