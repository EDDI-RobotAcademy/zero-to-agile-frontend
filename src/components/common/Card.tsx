import { ReactNode } from 'react';

interface Props {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function Card({ title, children, actions }: Props) {
  return (
    <div className="rounded-2xl border border-slate-100/80 bg-white/95 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : <span />}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
