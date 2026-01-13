import Link from 'next/link';
import { Card } from '@/components/common/Card';

export default function RoleSelectPage() {
  const roles = [
    {
      key: 'finder',
      title: '임차인으로 시작하기',
      desc: '예산·지역·방 개수만 입력하면 맞춤 의뢰서와 추천 매물을 바로 받아요.',
      href: '/auth/login?role=finder',
      tone: 'from-blue-50 via-blue-50 to-blue-100 border-blue-100 text-slate-700',
    },
    {
      key: 'owner',
      title: '임대인으로 시작하기',
      desc: '내 매물을 등록하고, 맞춤 수요서와 컨택 요청을 한 화면에서 관리합니다.',
      href: '/auth/login?role=owner',
      tone:
        'from-indigo-50 via-indigo-50 to-indigo-100 border-indigo-100 text-slate-700',
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8">
      <section className="mt-[50px] overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-50 p-6 md:p-8 shadow-sm ring-1 ring-blue-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-[30px] font-semibold tracking-[-0.015em] text-slate-900 ">
              AgileBang 시작하기
            </h1>
            <p className="text-sm tracking-[-0.005em] leading-relaxed text-slate-500">
              나에게 맞는 역할을 선택하세요
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <Card
            key={role.key}
            title={role.title}
          >
            <div
              className={`relative overflow-hidden rounded-2xl border ${role.tone} bg-gradient-to-br p-5`}
            >
              <p className="text-sm text-slate-700">{role.desc}</p>
              <div className="mt-5 flex justify-end">
                <Link
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
                  href={role.href}
                >
                  선택하고 계속하기
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
