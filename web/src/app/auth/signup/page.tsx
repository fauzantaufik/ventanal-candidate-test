// TODO: Implement the signup page using Supabase Auth
//
// This page should:
// 1. Show a name + email + password form
// 2. Call supabase.auth.signUp({ email, password, options: { data: { full_name } } })
// 3. On success, show a "check your email" confirmation message
// 4. Show a link to /auth/login for existing users
// 5. Handle and display errors
//
// See: https://supabase.com/docs/reference/javascript/auth-signup

export default function SignupPage() {
  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear cuenta</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-medium">Por implementar</p>
        <p className="mt-1">
          Implementa esta página con Supabase Auth como parte del test.
        </p>
      </div>
    </div>
  );
}
