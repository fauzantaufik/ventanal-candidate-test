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

interface LoginErrors {
  email?: string;
  password?: string;
}

function getSafeReturnTo(returnTo: string | null): string {
  return returnTo && returnTo.startsWith('/') ? returnTo : '/';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = getSafeReturnTo(searchParams.get('returnTo'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: LoginErrors = {};
    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      errors.email = 'Ingresa un correo válido.';
    }

    if (!password) {
      errors.password = 'Ingresa tu contraseña.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      const message = error.message.toLowerCase();
      if (
        message.includes('invalid login credentials') ||
        message.includes('invalid_credentials') ||
        message.includes('invalid login') ||
        message.includes('invalid credentials') ||
        message.includes('wrong password') ||
        message.includes('user not found')
      ) {
        setFormError('Correo o contraseña incorrectos.');
      } else if (message.includes('rate limit')) {
        setFormError(
          'Has intentado demasiadas veces. Espera un momento antes de volver a intentarlo.'
        );
      } else if (message.includes('email not confirmed')) {
        setFormError('Confirma tu correo antes de iniciar sesión.');
      } else {
        setFormError('No se pudo iniciar sesión. Inténtalo de nuevo.');
      }
      return;
    }

    if (data.session) {
      router.replace(destination);
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>
          Entra para continuar y dejar tus reseñas.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {formError && <Alert className="mb-4">{formError}</Alert>}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldErrors.password ? 'border-red-400 bg-red-50' : ''}
              placeholder="Tu contraseña"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link
            href={`/auth/signup?returnTo=${encodeURIComponent(destination)}`}
            className="font-medium text-blue-600 hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
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
        <LoginForm />
      </Suspense>
    </div>
  );
}
