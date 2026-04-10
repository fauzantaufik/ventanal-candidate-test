'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (fullName.trim().length < 2) {
      errors.fullName = 'El nombre debe tener al menos 2 caracteres.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.email = 'Ingresa un correo válido.';
    }

    if (password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    setLoading(false);

    if (error) {
      if (
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already exists') ||
        error.message.toLowerCase().includes('user already')
      ) {
        setFormError('Ya existe una cuenta con ese correo. Inicia sesión.');
      } else {
        setFormError('No se pudo crear la cuenta. Inténtalo de nuevo.');
      }
      return;
    }

    if (data.session) {
      router.replace(returnTo ?? '/');
    } else {
      setEmailSent(true);
    }
  }

  if (emailSent) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Revisa tu correo
        </h1>
        <p className="text-gray-600 text-sm">
          Te enviamos un enlace para confirmar tu cuenta antes de continuar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Crear cuenta
        </h1>
        <p className="text-sm text-gray-600">
          Únete para dejar reseñas en negocios locales.
        </p>
      </div>

      {formError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre completo
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.fullName
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
            placeholder="Tu nombre"
          />
          {fieldErrors.fullName && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
          )}
        </div>

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
            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.email
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
            placeholder="tu@correo.com"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.password
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
            placeholder="Mínimo 8 caracteres"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link
          href={`/auth/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
          className="text-blue-600 hover:underline font-medium"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
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
        <SignupForm />
      </Suspense>
    </div>
  );
}
