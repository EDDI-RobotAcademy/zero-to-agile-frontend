"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { getFinderRequestById } from '@/lib/repositories/finderRepository';
import { sendContactRequest } from '@/lib/repositories/ownerRepository';
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

type PageProps = { params: Promise<{ id: string }> };

export default function OwnerFinderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [finderId, setFinderId] = useState<string | null>(null);
  const [finderRequest, setFinderRequest] = useState<FinderRequestDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.resolve(params).then(({ id }) => {
      if (!active) return;
      setFinderId(id);
      getFinderRequestById(id).then((data) => {
        if (active) setFinderRequest(data);
      });
    });
    return () => {
      active = false;
    };
  }, [params]);

  const handleContact = async () => {
    if (!finderRequest?.finderId || !finderId) return;
    await sendContactRequest(finderRequest.finderId, 'listing-1', 'owner-1');
    setMessage('컨택 요청을 보냈습니다.');
  };

  if (!finderRequest) {
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
      <Card title={`임차인 ${finderRequest.finderId}`} actions={null}>
        <dl className="grid grid-cols-2 gap-3 text-sm text-gray-700">
          <div>
            <dt className="font-semibold">지역</dt>
            <dd>{finderRequest.preferredArea}</dd>
          </div>
          <div>
            <dt className="font-semibold">매물 종류</dt>
            <dd>{RESIDENCE_LABEL[finderRequest.residenceType] ?? finderRequest.residenceType}</dd>
          </div>
          <div>
            <dt className="font-semibold">계약 형태</dt>
            <dd>{DEAL_LABEL[finderRequest.dealType] ?? finderRequest.dealType}</dd>
          </div>
          <div>
            <dt className="font-semibold">
              예산 ({finderRequest.dealType === 'sale' ? '매매가' : '보증금'})
            </dt>
            <dd>{finderRequest.budget.toLocaleString()} 만원</dd>
          </div>
          <div>
            <dt className="font-semibold">면적</dt>
            <dd>{finderRequest.area} m² 이상</dd>
          </div>
          <div>
            <dt className="font-semibold">방/욕실</dt>
            <dd>
              {finderRequest.roomCount} / {finderRequest.bathroomCount}
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
