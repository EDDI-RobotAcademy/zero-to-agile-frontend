import './global.css';
import { RoleProvider } from '@/lib/auth/roleContext';
// 1. 라이브러리 import
import { GoogleTagManager } from '@next/third-parties/google';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || '';

  return (
    <html lang="ko">
      {/* 2. GTM 컴포넌트 추가 (html 태그 내부, body 형제 레벨 혹은 body 내부 어디든 상관없으나 보통 최상단) */}
      <GoogleTagManager gtmId={gtmId} />
      <body>
        <RoleProvider>
          <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-5xl py-8">{children}</div>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}