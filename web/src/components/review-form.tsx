'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface ReviewFormProps {
  businessSlug: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ businessSlug, onReviewSubmitted }: ReviewFormProps) {
  const [authState, setAuthState] = useState<'loading' | 'anonymous' | 'authenticated'>('loading');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(session ? 'authenticated' : 'anonymous');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? 'authenticated' : 'anonymous');
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authState === 'loading') {
    return (
      <div className="h-24 rounded-lg bg-gray-100 animate-pulse" />
    );
  }

  if (authState === 'anonymous') {
    const returnTo = `/${businessSlug}#reviews`;
    const loginHref = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-center">
        <p className="text-base font-semibold text-gray-900 mb-1">
          ¿Quieres dejar tu reseña?
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Inicia sesión para compartir tu experiencia y ayudar a otros clientes a decidir con confianza.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href={loginHref}
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

  // authState === 'authenticated' — US-05 will implement the full form
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-sm text-gray-400">
      <p className="font-medium">Formulario de reseña — por implementar (US-05)</p>
      <p className="mt-1 text-xs">businessSlug: {businessSlug}</p>
    </div>
  );
}
