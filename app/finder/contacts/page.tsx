"use client";

import { useRouter } from 'next/navigation';

export default function FinderContactsPage() {
  const router = useRouter();

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-white to-teal-50 px-8 py-8 shadow-lg ring-1 ring-emerald-100">
        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-600 p-1.5">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Contact</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">컨텍 요청 관리</h1>
          <p className="text-sm text-slate-600">
            임대인과의 컨텍 요청을 확인하고 관리하세요
          </p>
        </div>
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-200/30 blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-teal-200/30 blur-2xl"></div>
      </div>

      {/* 선택 카드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 내가 보낸 컨텍 요청 */}
        <div
          onClick={() => router.push('/finder/contacts/sender')}
          className="group cursor-pointer overflow-hidden rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-200 transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-emerald-400 hover:-translate-y-1"
        >
          <div className="mb-5 flex items-center justify-center">
            <div className="rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 p-6 shadow-sm transition-all group-hover:scale-105">
              <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
          <h3 className="mb-2 text-center text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
            내가 보낸 컨텍 요청
          </h3>
          <p className="mb-4 text-center text-sm text-slate-500">
            임대인에게 보낸 컨텍 요청을 확인하세요
          </p>
          <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-emerald-600 transition-all group-hover:gap-2">
            <span>바로가기</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* 내가 받은 컨텍 요청 */}
        <div
          onClick={() => router.push('/finder/contacts/receiver')}
          className="group cursor-pointer overflow-hidden rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-200 transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-purple-400 hover:-translate-y-1"
        >
          <div className="mb-5 flex items-center justify-center">
            <div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-6 shadow-sm transition-all group-hover:scale-105">
              <svg className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
          <h3 className="mb-2 text-center text-lg font-bold text-slate-900 transition-colors group-hover:text-purple-700">
            내가 받은 컨텍 요청
          </h3>
          <p className="mb-4 text-center text-sm text-slate-500">
            임대인이 보낸 컨텍 요청을 확인하고 관리하세요
          </p>
          <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-purple-600 transition-all group-hover:gap-2">
            <span>바로가기</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}
