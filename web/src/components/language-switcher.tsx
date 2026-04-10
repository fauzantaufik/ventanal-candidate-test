'use client';

import { useI18n, type Locale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
      className="text-sm text-stone-600 hover:text-stone-900 border border-[var(--color-border)] rounded-md px-2 py-1 transition-colors"
      aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      {locale === 'es' ? 'EN' : 'ES'}
    </button>
  );
}
