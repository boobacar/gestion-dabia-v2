import { signInAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Connexion</h1>
      <p className="text-sm text-slate-600">
        Utilise tes identifiants Supabase Auth pour accéder à Gestion Dabia v2.
      </p>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {decodeURIComponent(error)}
        </p>
      ) : null}

      <form action={signInAction} className="space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-md border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Mot de passe"
          className="w-full rounded-md border px-3 py-2"
        />
        <button className="w-full rounded-md bg-slate-900 px-3 py-2 text-white">
          Se connecter
        </button>
      </form>
    </div>
  );
}
