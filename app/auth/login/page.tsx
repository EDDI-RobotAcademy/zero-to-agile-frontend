"use client";

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/lib/auth/roleContext';
import { Button } from '@/components/common/Button';

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="p-6 text-sm text-gray-600">로그인 페이지를 준비 중입니다...</main>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, redirectToGoogle } = useRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const roleParam = searchParams.get('role');
  const roleLabel = roleParam === 'finder' ? '임차인' : roleParam === 'owner' ? '임대인' : null;

  const nextPath = useMemo(() => {
    if (roleParam === 'finder') return '/finder';
    if (roleParam === 'owner') return '/owner/listings';
    return '/auth/role-select';
  }, [roleParam]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (roleParam !== 'finder' && roleParam !== 'owner') {
      router.push('/auth/role-select');
      return;
    }
    if (typeof window !== 'undefined' && email) {
      window.localStorage.setItem('userName', email.split('@')[0] || email);
    }
    login(roleParam);
    router.push(nextPath);
  };

  const handleGoogleLogin = () => {
    if (roleParam !== 'finder' && roleParam !== 'owner') {
      router.push('/auth/role-select');
      return;
    }
    if (typeof window !== 'undefined' && email) {
      window.localStorage.setItem('userName', email.split('@')[0] || email);
    } else if (typeof window !== 'undefined') {
      window.localStorage.removeItem('userName');
    }
    // 역할을 미리 저장해 두고 백엔드 OAuth 엔드포인트로 이동
    redirectToGoogle(roleParam);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <div className="mt-[50px] overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-blue-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[12px] font-medium tracking-tight text-blue-500 ml-0.5">로그인</p>
            <h1 className="text-[26px] font-semibold tracking-[-0.015em] mb-1 text-slate-900">
              {roleLabel ?? '역할을 선택하고 로그인하세요'}
            </h1>
          </div>
          <Link
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5"
            href="/auth/role-select"
          >
            역할 다시 선택하기
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              placeholder="example@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              placeholder="********"
            />
          </div>
          <Button type="submit" className="w-full rounded-lg py-2.5 text-base">
            로그인
          </Button>
        </form>

        <div className="space-y-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-800">소셜 로그인</p>
          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
              onClick={handleGoogleLogin}
            >
              Google로 계속하기
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2.5 text-sm font-semibold text-yellow-800 transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-lg"
            >
              Kakao로 계속하기
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
            >
              Naver로 계속하기
            </button>
          </div>
          <p className="text-xs text-slate-500">
            (데모) 버튼은 UI용으로만 제공되며 실제 소셜 로그인 연동은 포함되어 있지 않습니다.
          </p>
        </div>
      </div>
    </main>
  );
}


