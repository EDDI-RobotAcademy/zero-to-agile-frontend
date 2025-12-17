"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/lib/auth/roleContext';

export default function Home() {
  const router = useRouter();
  const { role, isReady } = useRole();

  useEffect(() => {
    if (!isReady) return;
    if (role === 'tenant') router.replace('/tenant');
    else if (role === 'landlord') router.replace('/landlord');
    else router.replace('/auth/role-select');
  }, [role, isReady, router]);

  return (
    <main className="flex h-screen items-center justify-center">
      <p className="text-sm text-gray-600">이동 중...</p>
    </main>
  );
}
