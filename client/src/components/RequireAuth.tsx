import { Navigate } from "react-router";
import type { Role } from "@helpdesk/core";
import { useSession } from "../lib/auth";

export default function RequireAuth({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: Role;
}) {
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

  if (role && data.user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
