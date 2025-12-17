"use client";

import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className, ...props }: Props) {
  const base =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  return (
    <button
      className={[
        'rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60',
        base,
        className ?? '',
      ].join(' ')}
      {...props}
    />
  );
}
