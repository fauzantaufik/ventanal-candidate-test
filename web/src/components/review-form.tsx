'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { submitReview, ReviewError } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { StarIcon, StarOutlineIcon } from '@/components/icons';

interface ReviewFormProps {
  businessSlug: string;
  onReviewSubmitted?: () => void;
}

type FormState =
  | 'loading'
  | 'anonymous'
  | 'idle'
  | 'submitting'
  | 'success'
  | 'already_reviewed'
  | 'session_expired';

function StarPicker({
  value,
  hover,
  onHover,
  onLeave,
  onSelect,
  disabled,
}: {
  value: number;
  hover: number;
  onHover: (n: number) => void;
  onLeave: () => void;
  onSelect: (n: number) => void;
  disabled: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="flex gap-1" role="group" aria-label={t('form.rating')}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            aria-label={`${n} ${n !== 1 ? t('form.starsLabel') : t('form.starLabel')}`}
            onMouseEnter={() => onHover(n)}
            onMouseLeave={onLeave}
            onClick={() => onSelect(n)}
            className={`text-2xl transition-transform ${
              active ? 'text-yellow-400' : 'text-stone-300'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
          >
            {active ? <StarIcon className="h-7 w-7" /> : <StarOutlineIcon className="h-7 w-7" />}
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewForm({ businessSlug, onReviewSubmitted }: ReviewFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [formState, setFormState] = useState<FormState>('loading');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setFormState(session ? 'idle' : 'anonymous');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setFormState((prev) => {
        // Don't override terminal states after a submission
        if (prev === 'success' || prev === 'already_reviewed') return prev;
        return session ? 'idle' : 'anonymous';
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || formState === 'submitting') return;

    setFormState('submitting');
    setErrorMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setFormState('session_expired');
        return;
      }

      await submitReview(
        businessSlug,
        { rating, comment: comment.trim() || undefined },
        session.access_token,
      );

      setFormState('success');
      onReviewSubmitted?.();
      router.refresh();
    } catch (err) {
      if (err instanceof ReviewError) {
        if (err.status === 401) {
          setFormState('session_expired');
        } else if (err.status === 409) {
          setFormState('already_reviewed');
        } else {
          setErrorMsg(err.message);
          setFormState('idle');
        }
      } else {
        setErrorMsg(t('form.errorGeneric'));
        setFormState('idle');
      }
    }
  };

  if (formState === 'loading') {
    return <div className="h-24 rounded-lg bg-orange-50 animate-pulse" />;
  }

  if (formState === 'anonymous') {
    const returnTo = `/${businessSlug}#reviews`;
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-primary-light)] p-5 text-center">
        <p className="text-base font-semibold text-stone-900 mb-1">{t('form.anonTitle')}</p>
        <p className="text-sm text-stone-600 mb-4">
          {t('form.anonBody')}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
            className="inline-block bg-[var(--color-primary)] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            {t('form.anonLogin')}
          </Link>
          <Link
            href={`/auth/signup?returnTo=${encodeURIComponent(returnTo)}`}
            className="inline-block border border-[var(--color-border)] text-stone-700 text-sm font-medium px-5 py-2 rounded-lg hover:bg-stone-50 transition-colors"
          >
            {t('form.anonSignup')}
          </Link>
        </div>
      </div>
    );
  }

  if (formState === 'success') {
    return (
      <div className="rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-light)] p-5 text-center">
        <p className="text-base font-semibold text-[var(--color-success)] mb-1">
          {t('form.successTitle')}
        </p>
        <p className="text-sm text-[var(--color-success)]">{t('form.successBody')}</p>
      </div>
    );
  }

  if (formState === 'already_reviewed') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-center">
        <p className="text-base font-semibold text-amber-800 mb-1">
          {t('form.alreadyTitle')}
        </p>
        <p className="text-sm text-amber-700">{t('form.alreadyBody')}</p>
      </div>
    );
  }

  if (formState === 'session_expired') {
    const returnTo = `/${businessSlug}#reviews`;
    return (
      <div className="rounded-lg border border-[var(--color-warning-border)] bg-[var(--color-warning-light)] p-5 text-center">
        <p className="text-base font-semibold text-[var(--color-warning)] mb-1">{t('form.expiredTitle')}</p>
        <p className="text-sm text-[var(--color-warning)] mb-4">
          {t('form.expiredBody')}
        </p>
        <Link
          href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
          className="inline-block bg-[var(--color-primary)] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          {t('form.expiredLogin')}
        </Link>
      </div>
    );
  }

  // idle or submitting — show the interactive form
  const isSubmitting = formState === 'submitting';
  const canSubmit = rating > 0 && !isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">{t('form.rating')}</label>
        <StarPicker
          value={rating}
          hover={hover}
          onHover={setHover}
          onLeave={() => setHover(0)}
          onSelect={setRating}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="review-comment" className="block text-sm font-medium text-stone-700 mb-1">
          {t('form.comment')} <span className="text-stone-400 font-normal">{t('form.optional')}</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          disabled={isSubmitting}
          rows={3}
          maxLength={500}
          placeholder={t('form.placeholder')}
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] disabled:bg-stone-50 disabled:text-stone-400 resize-none"
        />
        <p className="text-right text-xs text-stone-400 mt-0.5">{comment.length} / 500</p>
      </div>

      {errorMsg && (
        <p className="text-sm text-[var(--color-error)] bg-[var(--color-error-light)] border border-[var(--color-error-border)] rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-[var(--color-primary)] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('form.submitting') : t('form.submit')}
      </button>
    </form>
  );
}
