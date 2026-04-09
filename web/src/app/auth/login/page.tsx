// TODO: Implement the login page using Supabase Auth
//
// This page should:
// 1. Show an email + password form
// 2. Call supabase.auth.signInWithPassword({ email, password })
// 3. On success, redirect to the page the user was on (or '/')
// 4. Show a link to /auth/signup for new users
// 5. Handle and display errors (invalid credentials, etc.)
//
// See: https://supabase.com/docs/reference/javascript/auth-signinwithpassword

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Iniciar sesión</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-medium">Por implementar</p>
        <p className="mt-1">
          Implementa esta página con Supabase Auth como parte del test.
        </p>
      </div>
    </div>
  );
}
