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
  const { t } = useI18n();
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
      errors.fullName = t('signup.fullNameError');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      errors.email = t('signup.emailError');
    }

    if (password.length < 8) {
      errors.password = t('signup.passwordMinError');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = t('signup.passwordFormatError');
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
        setFormError(t('signup.error.exists'));
      } else if (message.includes('rate limit')) {
        setFormError(t('signup.error.rateLimit'));
      } else if (message.includes('invalid') && message.includes('email')) {
        setFormError(t('signup.error.invalidEmail'));
      } else if (message.includes('password')) {
        setFormError(t('signup.error.password'));
      } else {
        setFormError(t('signup.error.generic'));
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
      setFormError(t('signup.error.autoLogin'));
      return;
    }

    setEmailSent(true);
  }

  if (emailSent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('signup.confirmTitle')}</CardTitle>
          <CardDescription>
            {t('signup.confirmBody')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-stone-600">
            {t('signup.confirmHint')}
          </p>
          <Link
            href={`/auth/login?returnTo=${encodeURIComponent(destination)}`}
            className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            {t('signup.goToLogin')}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('signup.title')}</CardTitle>
        <CardDescription>
          {t('signup.subtitle')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {formError && <Alert className="mb-4">{formError}</Alert>}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <Label htmlFor="fullName">{t('signup.fullName')}</Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={fieldErrors.fullName ? 'border-red-400 bg-red-50' : ''}
              placeholder={t('signup.fullNamePlaceholder')}
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">{t('signup.email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldErrors.email ? 'border-red-400 bg-red-50' : ''}
              placeholder={t('signup.emailPlaceholder')}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">{t('signup.password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldErrors.password ? 'border-red-400 bg-red-50' : ''}
              placeholder={t('signup.passwordPlaceholder')}
            />
            {fieldErrors.password ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            ) : (
              <p className="mt-1 text-xs text-stone-500">
                {t('signup.passwordHint')}
              </p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t('signup.loading') : t('signup.button')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          {t('signup.hasAccount')}{' '}
          <Link
            href={`/auth/login?returnTo=${encodeURIComponent(destination)}`}
            className="font-medium text-[var(--color-primary)] hover:underline"
          >
            {t('signup.loginLink')}
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
              <div className="mb-2 h-8 w-40 animate-pulse rounded bg-stone-100" />
              <div className="h-4 w-56 animate-pulse rounded bg-stone-100" />
            </CardHeader>
          </Card>
        }
      >
        <SignupForm />
      </Suspense>
    </div>
  );
}
