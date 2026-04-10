interface AlertProps {
  children?: any;
  className?: string;
}

export function Alert({ children, className = '' }: AlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 ${className}`}
    >
      {children}
    </div>
  );
}
