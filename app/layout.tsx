import './global.css';
import { RoleProvider } from '@/lib/auth/roleContext';
import { ChatbotWidget } from '@/components/chat/ChatbotWidget';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <RoleProvider>
          <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-5xl py-8">{children}</div>
            <ChatbotWidget />
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
