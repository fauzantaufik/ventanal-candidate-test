'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

function getSafeReturnTo(returnTo: string | null): string {
  return returnTo && returnTo.startsWith('/') ? returnTo : '/';
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = getSafeReturnTo(searchParams.get('returnTo'));

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};
    const trimmedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      errors.fullName = 'El nombre debe tener al menos 2 caracteres.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      errors.email = 'Ingresa un correo válido.';
    }

    if (password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Usa mayúsculas, minúsculas y al menos un número.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    const normalizedEmail = email.trim().toLowerCase();
    const emailRedirectTo =
      typeof window !== 'undefined'
        ? new URL(destination, window.location.origin).toString()
        : undefined;

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { full_name: fullName.trim() },
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
    });

    if (error) {
      setLoading(false);

      const message = error.message.toLowerCase();
      if (
        message.includes('already registered') ||
        message.includes('already exists') ||
        message.includes('user already')
      ) {
        setFormError('Ya existe una cuenta con ese correo. Inicia sesión.');
      } else if (message.includes('rate limit')) {
        setFormError('Has intentado demasiadas veces. Espera un momento antes de volver a intentarlo.');
      } else if (message.includes('invalid') && message.includes('email')) {
        setFormError('Ingresa un correo válido.');
      } else if (message.includes('password')) {
        setFormError('La contraseña no cumple los requisitos de seguridad.');
      } else {
        setFormError('No se pudo crear la cuenta. Inténtalo de nuevo.');
      }
      return;
    }

    if (data.session) {
      setLoading(false);
      router.replace(destination);
      router.refresh();
      return;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setLoading(false);

    if (signInData.session) {
      router.replace(destination);
      router.refresh();
      return;
    }

    if (
      signInError &&
      !signInError.message.toLowerCase().includes('email not confirmed')
    ) {
      setFormError(
        'La cuenta fue creada, pero no se pudo iniciar sesión automáticamente. Intenta iniciar sesión manualmente.'
      );
      return;
    }

    setEmailSent(true);
  }

  if (emailSent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revisa tu correo</CardTitle>
          <CardDescription>
            Te enviamos un enlace para confirmar tu cuenta antes de continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Después de confirmar tu correo, volverás a la página desde la que empezaste.
          </p>
          <Link
            href={`/auth/login?returnTo=${encodeURIComponent(destination)}`}
            className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Ir a iniciar sesión
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>
          Únete para dejar reseñas en negocios locales.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {formError && <Alert className="mb-4">{formError}</Alert>}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={fieldErrors.fullName ? 'border-red-400 bg-red-50' : ''}
              placeholder="Tu nombre"
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldErrors.email ? 'border-red-400 bg-red-50' : ''}
              placeholder="tu@correo.com"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldErrors.password ? 'border-red-400 bg-red-50' : ''}
              placeholder="Mínimo 8 caracteres, con mayúsculas y números"
            />
            {fieldErrors.password ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Usa al menos 8 caracteres, con mayúsculas, minúsculas y un número.
              </p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link
            href={`/auth/login?returnTo=${encodeURIComponent(destination)}`}
            className="font-medium text-blue-600 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <div className="mb-2 h-8 w-40 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-56 animate-pulse rounded bg-gray-100" />
            </CardHeader>
          </Card>
        }
      >
        <SignupForm />
      </Suspense>
    </div>
  );
}
