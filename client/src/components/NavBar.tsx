import { Link, useNavigate } from "react-router";
import { signOut, useSession } from "../lib/auth";

export default function NavBar() {
  const navigate = useNavigate();
  const { data } = useSession();
  const name = data?.user.name ?? data?.user.email ?? "";
  const isAdmin = data?.user.role === "ADMIN";

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-slate-900">
            Helpdesk
          </Link>
          {isAdmin && (
            <Link to="/users" className="text-sm text-slate-600 hover:text-slate-900">
              Users
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-600">{name}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md bg-slate-900 text-white text-sm px-3 py-1.5 hover:bg-slate-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
