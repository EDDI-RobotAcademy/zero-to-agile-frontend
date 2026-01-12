"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FinderHomePage() {
  const router = useRouter();

  useEffect(() => {
    // OAuth 로그인 후 자동으로 의뢰서 목록 목록으로 리다이렉트
    router.replace('/finder/request');
  }, [router]);

  return (
    <main className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm text-slate-600">의뢰서 목록으로 이동 중...</p>
      </div>
    </main>
  );
}
