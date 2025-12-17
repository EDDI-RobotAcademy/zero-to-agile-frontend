"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { createLandlordListing } from '@/lib/repositories/landlordRepository';

const districts = ['마포구', '용산구', '영등포구'];
const listingTypes = ['apartment', 'officetel', 'villa', 'house', 'commercial'];
const contractTypes = ['jeonse', 'sale'];
const optionList = ['엘리베이터', '주차', '반려동물 가능', '테라스'];

export default function LandlordNewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '새 매물 제목',
    region: '서울시',
    district: '마포구',
    type: 'apartment',
    contractType: 'jeonse',
    price: 75000,
    area: 82,
    rooms: 3,
    bathrooms: 2,
    floor: 10,
    options: ['엘리베이터'],
    description: '채광 좋은 남향 집입니다.',
    aiDescription: '',
    images: ['https://placehold.co/600x360?text=새+매물'],
    ownerId: 'landlord-1',
    status: 'active' as const,
  });

  const handleChange = (key: string, value: string | number | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleOption = (option: string) => {
    setForm((prev) => {
      const exists = prev.options.includes(option);
      return { ...prev, options: exists ? prev.options.filter((o) => o !== option) : [...prev.options, option] };
    });
  };

  const generateDescription = () => {
    const keywords = form.description || '편안한 생활, 넉넉한 수납';
    const sentence = `이 집은 ${keywords} 을(를) 바탕으로, ${form.rooms}개의 방과 ${form.bathrooms}개의 욕실이 조화로운 공간입니다.`;
    setForm((prev) => ({ ...prev, aiDescription: sentence }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createLandlordListing({
      ...form,
      description: form.description,
      aiDescription: form.aiDescription || undefined,
    });
    router.push('/landlord/listings');
  };

  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-bold">매물 등록</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            제목
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            지역(구)
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.district}
              onChange={(e) => handleChange('district', e.target.value)}
            >
              {districts.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            매물 종류
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              {listingTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            계약 형태
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.contractType}
              onChange={(e) => handleChange('contractType', e.target.value)}
            >
              {contractTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            가격(만원)
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.price}
              onChange={(e) => handleChange('price', Number(e.target.value))}
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            면적(m²)
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.area}
              onChange={(e) => handleChange('area', Number(e.target.value))}
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            층수
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.floor}
              onChange={(e) => handleChange('floor', Number(e.target.value))}
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            방 개수
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.rooms}
              onChange={(e) => handleChange('rooms', Number(e.target.value))}
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-700">
            욕실 개수
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.bathrooms}
              onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
            />
          </label>
        </div>

        <div className="space-y-2 text-sm font-semibold text-gray-700">
          옵션
          <div className="flex flex-wrap gap-3">
            {optionList.map((option) => (
              <label key={option} className="flex items-center gap-2 font-normal text-gray-700">
                <input
                  type="checkbox"
                  checked={form.options.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <label className="space-y-2 text-sm font-semibold text-gray-700">
          설명 키워드
          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            rows={3}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </label>

        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={generateDescription}>
            AI 설명 생성
          </Button>
          <span className="text-sm text-gray-600">키워드를 기반으로 단순 문장을 만듭니다.</span>
        </div>

        <label className="space-y-2 text-sm font-semibold text-gray-700">
          생성된 AI 설명
          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            rows={3}
            value={form.aiDescription}
            onChange={(e) => handleChange('aiDescription', e.target.value)}
            placeholder="AI 설명 결과"
          />
        </label>

        <div className="flex gap-3">
          <Button type="submit">저장하기</Button>
          <Button variant="secondary" type="button" onClick={() => router.push('/landlord/listings')}>
            취소
          </Button>
        </div>
      </form>
    </main>
  );
}
