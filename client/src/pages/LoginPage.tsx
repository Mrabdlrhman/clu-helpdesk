import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn, useSession } from "../lib/auth";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = useSession();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  async function onSubmit(data: LoginFormData) {
    setError(null);
    const { error: signInError } = await signIn.email({
      email: data.email,
      password: data.password,
    });
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

  const baseInput =
    "mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2";
  const validInput = "border-slate-300 focus:ring-slate-900";
  const invalidInput = "border-red-500 focus:ring-red-500";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-8">
      <div className="max-w-sm w-full bg-white rounded-xl shadow p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-slate-600 text-sm">Helpdesk staff console</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? "true" : "false"}
              {...register("email")}
              className={`${baseInput} ${errors.email ? invalidInput : validInput}`}
            />
            {errors.email && (
              <span className="mt-1 block text-red-600 text-sm">
                {errors.email.message}
              </span>
            )}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? "true" : "false"}
              {...register("password")}
              className={`${baseInput} ${errors.password ? invalidInput : validInput}`}
            />
            {errors.password && (
              <span className="mt-1 block text-red-600 text-sm">
                {errors.password.message}
              </span>
            )}
          </label>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
