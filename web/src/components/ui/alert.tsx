interface AlertProps {
  children?: any;
  className?: string;
}

export function Alert({ children, className = '' }: AlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-lg border border-[var(--color-error-border)] bg-[var(--color-error-light)] p-3 text-sm text-[var(--color-error)] ${className}`}
    >
      {children}
    </div>
  );
}
