"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnerHomePage() {
  const router = useRouter();

  useEffect(() => {
    // OAuth 로그인 후 자동으로 매물 목록으로 리다이렉트
    router.replace('/owner/listings');
  }, [router]);

  return (
    <main className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm text-slate-600">매물 목록으로 이동 중...</p>
      </div>
    </main>
  );
}
