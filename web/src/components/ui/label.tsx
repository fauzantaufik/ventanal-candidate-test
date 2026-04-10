import type { LabelHTMLAttributes } from 'react';

type LabelProps = Omit<LabelHTMLAttributes<HTMLLabelElement>, 'children'> & {
  children?: any;
  className?: string;
};

export function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label
      className={`mb-1 block text-sm font-medium text-gray-700 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
