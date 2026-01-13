"use client";

import { useRouter } from 'next/navigation';

export default function OwnerContactsPage() {
  const router = useRouter();

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-50 p-8 shadow-sm ring-1 ring-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium tracking-tight text-blue-500 ml-0.5">
              컨텍 관리
            </p>
            <h2 className="text-[26px] font-semibold tracking-[-0.015em] mb-1 text-slate-900">
              컨텍 요청 관리
            </h2>
            <p className="text-sm tracking-[-0.005em] leading-relaxed text-slate-500">
              임차인과의 컨텍 요청을 확인하고 관리하세요
            </p>
          </div>
        </div>
      </div>

      {/* 선택 카드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 내가 보낸 컨텍 요청 */}
        <div
          onClick={() => router.push('/owner/contacts/sender')}
          className="group cursor-pointer overflow-hidden rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-200 transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-blue-400 hover:-translate-y-1"
        >
          <div className="mb-5 flex items-center justify-center">
            <div className="rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 p-6 shadow-sm transition-all group-hover:scale-105">
              <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
          <h3 className="mb-2 text-center text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-700">
            내가 보낸 컨텍 요청
          </h3>
          <p className="mb-4 text-center text-sm text-slate-500">
            임차인에게 보낸 컨텍 요청을 확인하세요
          </p>
          <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-blue-600 transition-all group-hover:gap-2">
            <span>바로가기</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* 내가 받은 컨텍 요청 */}
        <div
          onClick={() => router.push('/owner/contacts/receiver')}
          className="group cursor-pointer overflow-hidden rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-200 transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-purple-400 hover:-translate-y-1"
        >
          <div className="mb-5 flex items-center justify-center">
            <div className="rounded-full bg-gradient-to-br from-violet-100 to-purple-100 p-6 shadow-sm transition-all group-hover:scale-105">
              <svg className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
          <h3 className="mb-2 text-center text-lg font-bold text-slate-900 transition-colors group-hover:text-purple-700">
            내가 받은 컨텍 요청
          </h3>
          <p className="mb-4 text-center text-sm text-slate-500">
            임차인이 보낸 컨텍 요청을 확인하고 관리하세요
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
