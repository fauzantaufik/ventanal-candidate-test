import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: any;
  className?: string;
  variant?: 'default' | 'outline';
}

export function Button({
  children,
  className = '',
  variant = 'default',
  ...props
}: ButtonProps) {
  const variantClassName =
    variant === 'outline'
      ? 'border border-[var(--color-border)] bg-white text-stone-700 hover:bg-stone-50'
      : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]';

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClassName} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
