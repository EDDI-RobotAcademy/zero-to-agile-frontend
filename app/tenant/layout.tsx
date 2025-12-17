"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useRole } from '@/lib/auth/roleContext';

export default function TenantLayout({ children }: { children: ReactNode }) {
  const { role, isReady, logout } = useRole();
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (!isReady) return;
    if (!role || role !== 'tenant') {
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

  if (role !== 'tenant') {
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
          <p className="text-xs uppercase text-blue-600">임차인 전용</p>
          <h1 className="text-2xl font-bold">Tenant Dashboard</h1>
          <p className="text-sm text-gray-600">{(userName || '사용자')} 님, 안녕하세요!</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap gap-3 text-sm font-medium">
            <Link href="/tenant" className="rounded px-3 py-2 hover:bg-blue-50">
              홈
            </Link>
            <Link href="/tenant/request" className="rounded px-3 py-2 hover:bg-blue-50">
              내 의뢰서
            </Link>
            <Link href="/tenant/listings" className="rounded px-3 py-2 hover:bg-blue-50">
              추천 매물
            </Link>
            <Link href="/tenant/contacts" className="rounded px-3 py-2 hover:bg-blue-50">
              임대인 컨택
            </Link>
          </nav>
          <button
            onClick={handleLogout}
            className="rounded border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            로그아웃
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
