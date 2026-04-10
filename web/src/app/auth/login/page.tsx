'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Completa tu correo y contraseña.');
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (
        msg.includes('invalid login') ||
        msg.includes('invalid credentials') ||
        msg.includes('email not confirmed') ||
        msg.includes('wrong password') ||
        msg.includes('user not found')
      ) {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('No se pudo iniciar sesión. Inténtalo de nuevo.');
      }
      return;
    }

    const destination = returnTo?.startsWith('/') ? returnTo : '/';
    router.replace(destination);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Iniciar sesión
        </h1>
        <p className="text-sm text-gray-600">
          Accede para dejar tu reseña
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="tu@correo.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tu contraseña"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <Link
          href={`/auth/signup${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
          className="text-blue-600 hover:underline font-medium"
        >
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto mt-16">
      <Suspense
        fallback={
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="h-8 w-40 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-4 w-56 bg-gray-100 rounded animate-pulse" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
