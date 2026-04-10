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
import { useI18n } from '@/lib/i18n';

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
  const { t } = useI18n();
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
      errors.email = t('login.emailError');
    }

    if (!password) {
      errors.password = t('login.passwordError');
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
        setFormError(t('login.error.credentials'));
      } else if (message.includes('rate limit')) {
        setFormError(t('login.error.rateLimit'));
      } else if (message.includes('email not confirmed')) {
        setFormError(t('login.error.emailNotConfirmed'));
      } else {
        setFormError(t('login.error.generic'));
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
        <CardTitle>{t('login.title')}</CardTitle>
        <CardDescription>
          {t('login.subtitle')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {formError && <Alert className="mb-4">{formError}</Alert>}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <Label htmlFor="email">{t('login.email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldErrors.email ? 'border-[var(--color-error)] bg-[var(--color-error-light)]' : ''}
              placeholder={t('login.emailPlaceholder')}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">{t('login.password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldErrors.password ? 'border-[var(--color-error)] bg-[var(--color-error-light)]' : ''}
              placeholder={t('login.passwordPlaceholder')}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t('login.loading') : t('login.button')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          {t('login.noAccount')}{' '}
          <Link
            href={`/auth/signup?returnTo=${encodeURIComponent(destination)}`}
            className="font-medium text-[var(--color-primary)] hover:underline"
          >
            {t('login.createAccount')}
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
              <div className="mb-2 h-8 w-40 animate-pulse rounded bg-orange-100" />
              <div className="h-4 w-56 animate-pulse rounded bg-orange-50" />
            </CardHeader>
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
