"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useRole } from '@/lib/auth/roleContext';

export default function LandlordLayout({ children }: { children: ReactNode }) {
  const { role, isReady, logout } = useRole();
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (!isReady) return;
    if (!role || role !== 'landlord') {
      router.push('/auth/role-select');
    }
  }, [role, router, isReady]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('userName');
    setUserName(stored || '');
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/role-select');
  };

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-600">로딩 중...</p>
      </main>
    );
  }

  if (role !== 'landlord') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-600">접근 권한이 없습니다. 역할을 선택해주세요.</p>
      </main>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow">
        <div>
          <p className="text-xs uppercase text-emerald-600">임대인 전용</p>
          <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
          <p className="text-sm text-gray-600">{(userName || '사용자')} 님, 안녕하세요!</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap gap-3 text-sm font-medium">
            <Link href="/landlord" className="rounded px-3 py-2 hover:bg-emerald-50">
              홈
            </Link>
            <Link href="/landlord/listings" className="rounded px-3 py-2 hover:bg-emerald-50">
              내 매물
            </Link>
            <Link href="/landlord/listings/new" className="rounded px-3 py-2 hover:bg-emerald-50">
              매물 등록
            </Link>
            <Link href="/landlord/contacts" className="rounded px-3 py-2 hover:bg-emerald-50">
              컨택 요청
            </Link>
          </nav>
          <button
            onClick={handleLogout}
            className="rounded border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            로그아웃
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
