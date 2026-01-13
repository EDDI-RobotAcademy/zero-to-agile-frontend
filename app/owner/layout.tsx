"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useRole } from '@/lib/auth/roleContext';

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const { role, isReady, logout } = useRole();
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (!isReady) return;
    if (!role || role !== 'owner') {
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

  if (role !== 'owner') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-600">접근 권한이 없습니다. 역할을 선택해주세요.</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 전체 너비 Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* 왼쪽: 로고 + 네비게이션 */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-bold text-blue-600">AgileBang</h1>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">임대인</span>
            </div>

            <nav className="flex items-center gap-1">
              <Link
                href="/owner/listings"
                className="rounded-lg px-4 py-2 text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600"
              >
                내 매물
              </Link>
              <Link
                href="/owner/listings/new"
                className="rounded-lg px-4 py-2 text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600"
              >
                매물 등록
              </Link>
              <Link
                href="/owner/recommendations"
                className="rounded-lg px-4 py-2 text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600"
              >
                AI 추천
              </Link>
              <Link
                href="/owner/contacts"
                className="rounded-lg px-4 py-2 text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600"
              >
                컨택 요청
              </Link>
            </nav>
          </div>

          {/* 오른쪽: 사용자 정보 + 로그아웃 */}
          <div className="flex items-center gap-4">
            <span className="text-[15px] text-slate-600">{userName || '사용자'} 님</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 콘텐츠 영역 */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
