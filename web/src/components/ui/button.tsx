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
      ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
      : 'bg-blue-600 text-white hover:bg-blue-700';

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClassName} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
