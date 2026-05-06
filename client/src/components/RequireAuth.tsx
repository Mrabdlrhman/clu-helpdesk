import { Navigate } from "react-router";
import { useSession } from "../lib/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-600 flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!data) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
