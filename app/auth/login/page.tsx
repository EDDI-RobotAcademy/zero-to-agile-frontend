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
  const roleLabel = roleParam === 'tenant' ? '임차인' : roleParam === 'landlord' ? '임대인' : null;

  const nextPath = useMemo(() => {
    if (roleParam === 'tenant') return '/tenant';
    if (roleParam === 'landlord') return '/landlord';
    return '/auth/role-select';
  }, [roleParam]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (roleParam !== 'tenant' && roleParam !== 'landlord') {
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
    if (roleParam !== 'tenant' && roleParam !== 'landlord') {
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
    <main className="space-y-8">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-white to-blue-50 p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-sky-700">로그인</p>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              {roleLabel ?? '역할을 선택하고 로그인하세요'}
            </h1>
            <p className="text-sm text-slate-600">
              선택한 역할에 맞춰 맞춤 대시보드를 바로 시작할 수 있어요.
            </p>
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
          className="space-y-4 rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-inner shadow-slate-50 transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
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
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-inner shadow-slate-50 transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl py-3 text-base">
            로그인
          </Button>
        </form>

        <div className="space-y-3 rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold text-slate-800">소셜 로그인</p>
          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 shadow-inner shadow-slate-50 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg"
              onClick={handleGoogleLogin}
            >
              Google로 계속하기
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-3 text-sm font-semibold text-yellow-800 shadow-inner shadow-yellow-50 transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-lg"
            >
              Kakao로 계속하기
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-800 shadow-inner shadow-emerald-50 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
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
