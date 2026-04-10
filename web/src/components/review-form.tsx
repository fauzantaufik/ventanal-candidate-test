'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { submitReview, ReviewError } from '@/lib/api';

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
  return (
    <div className="flex gap-1" role="group" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}
            onMouseEnter={() => onHover(n)}
            onMouseLeave={onLeave}
            onClick={() => onSelect(n)}
            className={`text-2xl transition-transform ${
              active ? 'text-yellow-400' : 'text-gray-300'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewForm({ businessSlug, onReviewSubmitted }: ReviewFormProps) {
  const router = useRouter();
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
        setErrorMsg('No se pudo guardar la reseña. Inténtalo de nuevo.');
        setFormState('idle');
      }
    }
  };

  if (formState === 'loading') {
    return <div className="h-24 rounded-lg bg-gray-100 animate-pulse" />;
  }

  if (formState === 'anonymous') {
    const returnTo = `/${businessSlug}#reviews`;
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-center">
        <p className="text-base font-semibold text-gray-900 mb-1">¿Quieres dejar tu reseña?</p>
        <p className="text-sm text-gray-600 mb-4">
          Inicia sesión para compartir tu experiencia y ayudar a otros clientes a decidir con confianza.
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

  if (formState === 'success') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">
        <p className="text-base font-semibold text-green-800 mb-1">
          ¡Gracias por compartir tu experiencia!
        </p>
        <p className="text-sm text-green-700">Tu reseña ha sido publicada con éxito.</p>
      </div>
    );
  }

  if (formState === 'already_reviewed') {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-center">
        <p className="text-base font-semibold text-blue-800 mb-1">
          Ya dejaste una reseña para este negocio.
        </p>
        <p className="text-sm text-blue-700">Solo se permite una reseña por usuario.</p>
      </div>
    );
  }

  if (formState === 'session_expired') {
    const returnTo = `/${businessSlug}#reviews`;
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5 text-center">
        <p className="text-base font-semibold text-yellow-800 mb-1">Tu sesión expiró.</p>
        <p className="text-sm text-yellow-700 mb-4">
          Inicia sesión de nuevo para enviar tu reseña.
        </p>
        <Link
          href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
          className="inline-block bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Iniciar sesión
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
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
        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-1">
          Comentario <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          disabled={isSubmitting}
          rows={3}
          maxLength={500}
          placeholder="Comparte tu experiencia con este negocio..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 resize-none"
        />
        <p className="text-right text-xs text-gray-400 mt-0.5">{comment.length} / 500</p>
      </div>

      {errorMsg && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Enviando…' : 'Publicar reseña'}
      </button>
    </form>
  );
}
