"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/lib/auth/roleContext';

export default function Home() {
  const router = useRouter();
  const { role, isReady } = useRole();

  useEffect(() => {
    if (!isReady) return;
    if (role === 'finder') router.replace('/finder');
    else if (role === 'owner') router.replace('/owner/listings');
    else router.replace('/auth/role-select');
  }, [role, isReady, router]);

  return (
    <main className="flex h-screen items-center justify-center">
      <p className="text-sm text-gray-600">이동 중...</p>
    </main>
  );
}
