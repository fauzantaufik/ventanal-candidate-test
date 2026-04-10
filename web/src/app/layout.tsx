import type { Metadata } from 'next';
import Link from 'next/link';
import Providers from '@/components/providers';
import HeaderNav from '@/components/header-nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Directorio Local',
  description: 'Encuentra negocios locales de confianza',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[var(--color-surface)]">
        <Providers>
          <header className="bg-white border-b border-[var(--color-border)] px-4 py-3">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <Link href="/" className="text-lg font-bold text-[var(--color-primary)]">
                Directorio Local
              </Link>
              <HeaderNav />
            </div>
          </header>
          <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
