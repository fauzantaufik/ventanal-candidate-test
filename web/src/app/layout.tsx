import type { Metadata } from 'next';
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
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/" className="text-lg font-bold text-gray-900">
              Directorio Local
            </a>
            <nav className="flex items-center gap-4">
              {/* TODO: Add auth nav links here (login/signup/user menu) */}
              <a
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Iniciar sesión
              </a>
              <a
                href="/auth/signup"
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
              >
                Registrarse
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
