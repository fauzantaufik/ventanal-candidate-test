'use client';

import { createContext, createElement, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Supported locales
// ---------------------------------------------------------------------------
export type Locale = 'es' | 'en';

const STORAGE_KEY = 'directorio-locale';
const DEFAULT_LOCALE: Locale = 'es';

// ---------------------------------------------------------------------------
// Translation dictionary
// ---------------------------------------------------------------------------
const translations = {
  // ── Layout / nav ────────────────────────────────────────────────────────
  'nav.login': { es: 'Iniciar sesión', en: 'Sign in' },
  'nav.signup': { es: 'Registrarse', en: 'Sign up' },
  'nav.logout': { es: 'Cerrar sesión', en: 'Sign out' },

  // ── Home page ───────────────────────────────────────────────────────────
  'home.title': { es: 'Encuentra negocios locales', en: 'Find local businesses' },
  'home.subtitle': { es: 'Descubre servicios verificados cerca de ti', en: 'Discover verified services near you' },
  'home.all': { es: 'Todos', en: 'All' },
  'home.error.title': { es: 'Error al cargar negocios', en: 'Error loading businesses' },
  'home.error.hint': {
    es: 'Asegúrate de que el worker esté corriendo:',
    en: 'Make sure the worker is running:',
  },
  'home.empty': { es: 'No se encontraron negocios', en: 'No businesses found' },
  'home.viewAll': { es: 'Ver todos los negocios', en: 'View all businesses' },
  'home.showing': { es: 'Mostrando', en: 'Showing' },
  'home.of': { es: 'de', en: 'of' },
  'home.businesses': { es: 'negocios', en: 'businesses' },

  // ── Business card ───────────────────────────────────────────────────────
  'business.verified': { es: 'Verificado', en: 'Verified' },
  'business.noReviews': { es: 'Sin reseñas aún', en: 'No reviews yet' },

  // ── Business detail page ────────────────────────────────────────────────
  'detail.back': { es: '← Volver al directorio', en: '← Back to directory' },
  'detail.unverified': { es: 'Sin verificar', en: 'Unverified' },
  'detail.verified': { es: 'Verificado', en: 'Verified' },
  'detail.premium': { es: 'Premium', en: 'Premium' },
  'detail.reviews': { es: 'reseñas', en: 'reviews' },
  'detail.reviewsTitle': { es: 'Reseñas', en: 'Reviews' },
  'detail.whatsapp': { es: 'WhatsApp', en: 'WhatsApp' },
  'detail.call': { es: 'Llamar', en: 'Call' },

  // ── Review list ─────────────────────────────────────────────────────────
  'reviews.starsLabel': { es: 'de 5 estrellas', en: 'of 5 stars' },
  'reviews.error': {
    es: 'No se pudieron cargar las reseñas. Por favor intenta de nuevo.',
    en: 'Could not load reviews. Please try again.',
  },
  'reviews.retry': { es: 'Reintentar', en: 'Retry' },
  'reviews.empty': {
    es: 'Este negocio aún no tiene reseñas. ¡Sé el primero!',
    en: 'This business has no reviews yet. Be the first!',
  },
  'reviews.loadMore': { es: 'Cargar más reseñas', en: 'Load more reviews' },
  'reviews.loading': { es: 'Cargando...', en: 'Loading...' },

  // Relative time (used programmatically — see timeAgo helper)
  'time.now': { es: 'ahora mismo', en: 'just now' },
  'time.year': { es: 'año', en: 'year' },
  'time.years': { es: 'años', en: 'years' },
  'time.month': { es: 'mes', en: 'month' },
  'time.months': { es: 'meses', en: 'months' },
  'time.week': { es: 'semana', en: 'week' },
  'time.weeks': { es: 'semanas', en: 'weeks' },
  'time.day': { es: 'día', en: 'day' },
  'time.days': { es: 'días', en: 'days' },
  'time.hour': { es: 'hora', en: 'hour' },
  'time.hours': { es: 'horas', en: 'hours' },
  'time.minute': { es: 'minuto', en: 'minute' },
  'time.minutes': { es: 'minutos', en: 'minutes' },
  'time.ago': { es: 'hace', en: '' }, // "hace 3 días" vs "3 days ago"
  'time.agoSuffix': { es: '', en: 'ago' },

  // ── Review form ─────────────────────────────────────────────────────────
  'form.rating': { es: 'Calificación', en: 'Rating' },
  'form.starLabel': { es: 'estrella', en: 'star' },
  'form.starsLabel': { es: 'estrellas', en: 'stars' },
  'form.comment': { es: 'Comentario', en: 'Comment' },
  'form.optional': { es: '(opcional)', en: '(optional)' },
  'form.placeholder': {
    es: 'Comparte tu experiencia con este negocio...',
    en: 'Share your experience with this business...',
  },
  'form.submit': { es: 'Publicar reseña', en: 'Submit review' },
  'form.submitting': { es: 'Enviando…', en: 'Submitting…' },
  'form.errorGeneric': {
    es: 'No se pudo guardar la reseña. Inténtalo de nuevo.',
    en: 'Could not save the review. Please try again.',
  },

  // Form states
  'form.anonTitle': { es: '¿Quieres dejar tu reseña?', en: 'Want to leave a review?' },
  'form.anonBody': {
    es: 'Inicia sesión para compartir tu experiencia y ayudar a otros clientes a decidir con confianza.',
    en: 'Sign in to share your experience and help other customers decide with confidence.',
  },
  'form.anonLogin': { es: 'Iniciar sesión', en: 'Sign in' },
  'form.anonSignup': { es: 'Crear cuenta', en: 'Create account' },
  'form.successTitle': {
    es: '¡Gracias por compartir tu experiencia!',
    en: 'Thanks for sharing your experience!',
  },
  'form.successBody': {
    es: 'Tu reseña ha sido publicada con éxito.',
    en: 'Your review has been published successfully.',
  },
  'form.alreadyTitle': {
    es: 'Ya dejaste una reseña para este negocio.',
    en: 'You already reviewed this business.',
  },
  'form.alreadyBody': {
    es: 'Solo se permite una reseña por usuario.',
    en: 'Only one review per user is allowed.',
  },
  'form.expiredTitle': { es: 'Tu sesión expiró.', en: 'Your session expired.' },
  'form.expiredBody': {
    es: 'Inicia sesión de nuevo para enviar tu reseña.',
    en: 'Sign in again to submit your review.',
  },
  'form.expiredLogin': { es: 'Iniciar sesión', en: 'Sign in' },

  // ── Login page ──────────────────────────────────────────────────────────
  'login.title': { es: 'Iniciar sesión', en: 'Sign in' },
  'login.subtitle': { es: 'Entra para continuar y dejar tus reseñas.', en: 'Sign in to continue and leave your reviews.' },
  'login.email': { es: 'Correo electrónico', en: 'Email address' },
  'login.emailPlaceholder': { es: 'tu@correo.com', en: 'you@email.com' },
  'login.emailError': { es: 'Ingresa un correo válido.', en: 'Enter a valid email.' },
  'login.password': { es: 'Contraseña', en: 'Password' },
  'login.passwordPlaceholder': { es: 'Tu contraseña', en: 'Your password' },
  'login.passwordError': { es: 'Ingresa tu contraseña.', en: 'Enter your password.' },
  'login.button': { es: 'Iniciar sesión', en: 'Sign in' },
  'login.loading': { es: 'Entrando...', en: 'Signing in...' },
  'login.noAccount': { es: '¿No tienes cuenta?', en: "Don't have an account?" },
  'login.createAccount': { es: 'Crear cuenta', en: 'Create account' },
  'login.error.credentials': { es: 'Correo o contraseña incorrectos.', en: 'Incorrect email or password.' },
  'login.error.rateLimit': {
    es: 'Has intentado demasiadas veces. Espera un momento antes de volver a intentarlo.',
    en: 'Too many attempts. Please wait a moment before trying again.',
  },
  'login.error.emailNotConfirmed': {
    es: 'Confirma tu correo antes de iniciar sesión.',
    en: 'Confirm your email before signing in.',
  },
  'login.error.generic': {
    es: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
    en: 'Could not sign in. Please try again.',
  },

  // ── Signup page ─────────────────────────────────────────────────────────
  'signup.title': { es: 'Crear cuenta', en: 'Create account' },
  'signup.subtitle': {
    es: 'Únete para dejar reseñas en negocios locales.',
    en: 'Join to leave reviews on local businesses.',
  },
  'signup.fullName': { es: 'Nombre completo', en: 'Full name' },
  'signup.fullNamePlaceholder': { es: 'Tu nombre', en: 'Your name' },
  'signup.fullNameError': {
    es: 'El nombre debe tener al menos 2 caracteres.',
    en: 'Name must be at least 2 characters.',
  },
  'signup.email': { es: 'Correo electrónico', en: 'Email address' },
  'signup.emailPlaceholder': { es: 'tu@correo.com', en: 'you@email.com' },
  'signup.emailError': { es: 'Ingresa un correo válido.', en: 'Enter a valid email.' },
  'signup.password': { es: 'Contraseña', en: 'Password' },
  'signup.passwordPlaceholder': {
    es: 'Mínimo 8 caracteres, con mayúsculas y números',
    en: 'At least 8 characters, with uppercase and numbers',
  },
  'signup.passwordMinError': {
    es: 'La contraseña debe tener al menos 8 caracteres.',
    en: 'Password must be at least 8 characters.',
  },
  'signup.passwordFormatError': {
    es: 'Usa mayúsculas, minúsculas y al menos un número.',
    en: 'Use uppercase, lowercase, and at least one number.',
  },
  'signup.passwordHint': {
    es: 'Usa al menos 8 caracteres, con mayúsculas, minúsculas y un número.',
    en: 'Use at least 8 characters, with uppercase, lowercase, and a number.',
  },
  'signup.button': { es: 'Crear cuenta', en: 'Create account' },
  'signup.loading': { es: 'Creando cuenta...', en: 'Creating account...' },
  'signup.hasAccount': { es: '¿Ya tienes cuenta?', en: 'Already have an account?' },
  'signup.loginLink': { es: 'Inicia sesión', en: 'Sign in' },
  'signup.error.exists': {
    es: 'Ya existe una cuenta con ese correo. Inicia sesión.',
    en: 'An account with that email already exists. Sign in.',
  },
  'signup.error.rateLimit': {
    es: 'Has intentado demasiadas veces. Espera un momento antes de volver a intentarlo.',
    en: 'Too many attempts. Please wait a moment before trying again.',
  },
  'signup.error.invalidEmail': { es: 'Ingresa un correo válido.', en: 'Enter a valid email.' },
  'signup.error.password': {
    es: 'La contraseña no cumple los requisitos de seguridad.',
    en: 'The password does not meet security requirements.',
  },
  'signup.error.generic': {
    es: 'No se pudo crear la cuenta. Inténtalo de nuevo.',
    en: 'Could not create the account. Please try again.',
  },
  'signup.error.autoLogin': {
    es: 'La cuenta fue creada, pero no se pudo iniciar sesión automáticamente. Intenta iniciar sesión manualmente.',
    en: 'The account was created, but auto-login failed. Please sign in manually.',
  },
  'signup.confirmTitle': { es: 'Revisa tu correo', en: 'Check your email' },
  'signup.confirmBody': {
    es: 'Te enviamos un enlace para confirmar tu cuenta antes de continuar.',
    en: 'We sent you a link to confirm your account before continuing.',
  },
  'signup.confirmHint': {
    es: 'Después de confirmar tu correo, volverás a la página desde la que empezaste.',
    en: 'After confirming your email, you will return to the page where you started.',
  },
  'signup.goToLogin': { es: 'Ir a iniciar sesión', en: 'Go to sign in' },
} as const;

export type TranslationKey = keyof typeof translations;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored === 'es' || stored === 'en') {
        setLocaleState(stored);
      }
    } catch {
      // SSR or blocked storage — ignore
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => translations[key]?.[locale] ?? key,
    [locale],
  );

  const value: I18nContextValue = { locale, setLocale, t };

  return createElement(I18nContext.Provider, { value }, children) as unknown as React.JSX.Element;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback for components outside the provider (e.g. SSR)
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key) => translations[key]?.[DEFAULT_LOCALE] ?? key,
    };
  }
  return ctx;
}
