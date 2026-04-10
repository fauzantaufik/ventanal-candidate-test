import type { InputHTMLAttributes } from 'react';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> & {
  className?: string;
};

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-[var(--color-focus)] focus:ring-2 focus:ring-[var(--color-focus)] disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
