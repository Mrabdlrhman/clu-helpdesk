import { useEffect, useState } from "react";

type Health = { status: string; uptime: number };

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setHealth)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-8">
      <div className="max-w-xl w-full bg-white rounded-xl shadow p-8 space-y-4">
        <h1 className="text-3xl font-bold">Helpdesk</h1>
        <p className="text-slate-600">
          AI-powered ticket management. Phase 1 scaffold ready.
        </p>
        <div className="border-t pt-4">
          <h2 className="font-semibold mb-2">Server status</h2>
          {error && <p className="text-red-600">Error: {error}</p>}
          {health && (
            <pre className="bg-slate-100 rounded p-3 text-sm">
              {JSON.stringify(health, null, 2)}
            </pre>
          )}
          {!health && !error && <p className="text-slate-500">Checking…</p>}
        </div>
      </div>
    </main>
  );
}
