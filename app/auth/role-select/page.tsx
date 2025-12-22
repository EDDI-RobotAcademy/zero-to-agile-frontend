import Link from 'next/link';
import { Card } from '@/components/common/Card';

export default function RoleSelectPage() {
  const roles = [
    {
      key: 'tenant',
      title: '임차인으로 시작하기',
      desc: '예산·지역·방 개수만 입력하면 맞춤 의뢰서와 추천 매물을 바로 받아요.',
      badge: '추천',
      href: '/auth/login?role=tenant',
      tone: 'from-blue-500/10 via-blue-400/10 to-blue-300/10 border-blue-200 text-blue-800',
    },
    {
      key: 'landlord',
      title: '임대인으로 시작하기',
      desc: '내 매물을 등록하고, 맞춤 수요서와 컨택 요청을 한 화면에서 관리합니다.',
      badge: '빠른 등록',
      href: '/auth/login?role=landlord',
      tone:
        'from-emerald-500/10 via-emerald-400/10 to-emerald-300/10 border-emerald-200 text-emerald-800',
    },
  ];

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-sky-700">역할 선택</p>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              나에게 맞는 온보딩을 선택하세요
            </h1>
            <p className="text-sm text-slate-600">
              역할을 선택하면 맞춤 로그인·폼·대시보드가 즉시 열립니다.
            </p>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
            1분 안에 온보딩 완료
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <Card
            key={role.key}
            title={role.title}
            actions={
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                {role.badge}
              </span>
            }
          >
            <div
              className={`relative overflow-hidden rounded-2xl border ${role.tone} bg-gradient-to-br p-5`}
            >
              <p className="text-sm text-slate-700">{role.desc}</p>
              <div className="mt-5 flex justify-end">
                <Link
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
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
