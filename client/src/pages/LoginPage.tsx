import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { signIn, useSession } from "../lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn.email({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message ?? "Sign in failed");
      return;
    }
    navigate("/", { replace: true });
  }

  if (sessionPending) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-600 flex items-center justify-center">
        Loading…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-8">
      <div className="max-w-sm w-full bg-white rounded-xl shadow p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-slate-600 text-sm">Helpdesk staff console</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </label>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
