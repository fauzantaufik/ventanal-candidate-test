type CardProps = {
  children?: any;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={`px-6 pt-6 pb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardProps) {
  return <h1 className={`text-2xl font-bold text-gray-900 ${className}`}>{children}</h1>;
}

export function CardDescription({ children, className = '' }: CardProps) {
  return <p className={`mt-1 text-sm text-gray-600 ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }: CardProps) {
  return <div className={`px-6 pb-6 ${className}`}>{children}</div>;
}
