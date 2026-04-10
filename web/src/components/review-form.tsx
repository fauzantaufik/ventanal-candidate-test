'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { submitReview, ReviewApiError } from '@/lib/api';

const MAX_COMMENT = 500;

interface ReviewFormProps {
  businessSlug: string;
  onReviewSubmitted?: () => void;
}

function StarPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const [hover, setHover] = useState(0);
  const labels = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          aria-label={labels[star - 1]}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl leading-none transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          <span className={(hover || value) >= star ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        </button>
      ))}
      {(hover || value) > 0 && (
        <span className="ml-2 text-sm text-gray-600">{labels[(hover || value) - 1]}</span>
      )}
    </div>
  );
}

export default function ReviewForm({ businessSlug, onReviewSubmitted }: ReviewFormProps) {
  const router = useRouter();
  const [authState, setAuthState] = useState<'loading' | 'anonymous' | 'authenticated'>('loading');
  const [token, setToken] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formState, setFormState] = useState<
    'idle' | 'submitting' | 'success' | 'already_reviewed' | 'error'
  >('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Keep latest token in a ref for the submit handler
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(session ? 'authenticated' : 'anonymous');
      setToken(session?.access_token ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? 'authenticated' : 'anonymous');
      setToken(session?.access_token ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const currentToken = tokenRef.current;
    if (!currentToken || rating === 0) return;

    setFormState('submitting');
    setErrorMsg('');

    try {
      await submitReview(
        businessSlug,
        { rating, comment: comment.trim() || undefined },
        currentToken,
      );
      setFormState('success');
      onReviewSubmitted?.();
      router.refresh();
    } catch (err) {
      if (err instanceof ReviewApiError) {
        if (err.status === 409) {
          setFormState('already_reviewed');
          return;
        }
        if (err.status === 401) {
          setAuthState('anonymous');
          return;
        }
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ocurrió un error inesperado. Por favor intenta de nuevo.');
      }
      setFormState('error');
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (authState === 'loading') {
    return <div className="h-24 rounded-lg bg-gray-100 animate-pulse" />;
  }

  // ── Anonymous ────────────────────────────────────────────────────────────
  if (authState === 'anonymous') {
    const returnTo = `/${businessSlug}#reviews`;
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-center">
        <p className="text-base font-semibold text-gray-900 mb-1">¿Quieres dejar tu reseña?</p>
        <p className="text-sm text-gray-600 mb-4">
          Inicia sesión para compartir tu experiencia y ayudar a otros clientes a decidir con
          confianza.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
            className="inline-block bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href={`/auth/signup?returnTo=${encodeURIComponent(returnTo)}`}
            className="inline-block border border-gray-300 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────
  if (formState === 'success' || formState === 'already_reviewed') {
    const isAlready = formState === 'already_reviewed';
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">
        <p className="text-2xl mb-2">{isAlready ? '✅' : '🎉'}</p>
        <p className="text-base font-semibold text-green-800">
          {isAlready
            ? 'Ya dejaste una reseña para este negocio.'
            : '¡Gracias por compartir tu experiencia!'}
        </p>
        {!isAlready && (
          <p className="text-sm text-green-700 mt-1">
            Tu reseña ha sido publicada y ayudará a otros clientes.
          </p>
        )}
      </div>
    );
  }

  // ── Authenticated form ────────────────────────────────────────────────────
  const isSubmitting = formState === 'submitting';
  const canSubmit = rating > 0 && !isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm font-semibold text-gray-800">Deja tu reseña</p>

      {/* Star picker */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Calificación <span className="text-red-500">*</span>
        </label>
        <StarPicker value={rating} onChange={setRating} disabled={isSubmitting} />
      </div>

      {/* Comment textarea */}
      <div>
        <label htmlFor="review-comment" className="block text-xs text-gray-500 mb-1">
          Comentario (opcional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
          disabled={isSubmitting}
          rows={3}
          placeholder="Comparte los detalles de tu experiencia…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
        />
        <p
          className={`text-right text-xs mt-0.5 ${
            comment.length >= MAX_COMMENT ? 'text-red-500 font-medium' : 'text-gray-400'
          }`}
        >
          {comment.length} / {MAX_COMMENT}
        </p>
      </div>

      {/* Error message */}
      {formState === 'error' && errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Enviando…
          </>
        ) : (
          'Publicar reseña'
        )}
      </button>
    </form>
  );
}
