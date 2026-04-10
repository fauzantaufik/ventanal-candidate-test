'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import LanguageSwitcher from '@/components/language-switcher';
import type { User } from '@supabase/supabase-js';

export default function HeaderNav() {
  const { t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  }

  return (
    <nav className="flex items-center gap-4">
      <LanguageSwitcher />

      {loading ? (
        <div className="h-8 w-20 animate-pulse rounded bg-orange-100" />
      ) : user ? (
        <>
          <span className="text-sm text-stone-600 truncate max-w-[140px]">
            {user.user_metadata?.full_name || user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            {t('nav.logout')}
          </button>
        </>
      ) : (
        <>
          <Link
            href="/auth/login"
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            {t('nav.login')}
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            {t('nav.signup')}
          </Link>
        </>
      )}
    </nav>
  );
}
