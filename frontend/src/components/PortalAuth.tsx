"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { ArrowLeft, ArrowRight, Loader2, Store } from "lucide-react";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

import AnimatedPage from "@/components/AnimatedPage";
import GlassButton from "@/components/GlassButton";
import GlassCard from "@/components/GlassCard";
import ThemeToggle from "@/components/ThemeToggle";
import api, { ApiErrorResponse } from "@/lib/axios";
import { AuthResponse, getDashboardRoute, getStoredUser, persistSession, UserRole } from "@/lib/auth";

type PortalAuthProps = {
  role: UserRole;
  title: string;
  description: string;
  accentClassName: string;
  icon: React.ReactNode;
  allowRegister?: boolean;
};

export default function PortalAuth({
  role,
  title,
  description,
  accentClassName,
  icon,
  allowRegister = false,
}: PortalAuthProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      router.replace(getDashboardRoute(user.role));
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>(
        isLogin ? "/auth/login" : "/auth/register",
        isLogin ? { email, password } : { name, email, password, businessName }
      );

      const { token, user } = response.data;

      if (user.role !== role) {
        toast.error("Please use the correct portal for this account.");
        setLoading(false);
        return;
      }

      persistSession(token, user);
      toast.success(isLogin ? `Welcome back, ${user.name}.` : "Account created successfully.");
      router.replace(getDashboardRoute(user.role));
    } catch (error) {
      const message =
        (error as AxiosError<ApiErrorResponse>).response?.data?.error ?? "Authentication failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="flex items-center justify-center">
      <Toaster position="top-center" toastOptions={{ className: "glass-panel text-[var(--text-primary)]" }} />

      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="group mb-8 inline-flex items-center gap-2 rounded-xl p-2 -ml-2 text-sm font-semibold text-[var(--text-secondary)] transition-all hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--glass-bg)] group-hover:bg-[var(--glass-bg-strong)] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to portal selection
        </Link>

        <GlassCard className="overflow-hidden px-0 py-0" hover={false}>
          <div className="border-b border-[var(--glass-border)] px-7 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-[24px] ${accentClassName}`}
            >
              {icon}
            </motion.div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
          </div>

          <div className="px-6 py-7 md:px-8 md:py-8">
            {allowRegister && (
              <div className="mb-6 grid grid-cols-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--button-secondary)] p-1">
                <button
                  type="button"
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${isLogin ? "bg-[var(--glass-bg-strong)] text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${!isLogin ? "bg-[var(--glass-bg-strong)] text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                  onClick={() => setIsLogin(false)}
                >
                  Register
                </button>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && allowRegister && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm text-[var(--text-secondary)]">Full name</span>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="glass-input w-full rounded-2xl px-4 py-3"
                      placeholder="Alex Morgan"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-[var(--text-secondary)]">Business name</span>
                    <input
                      required
                      type="text"
                      value={businessName}
                      onChange={(event) => setBusinessName(event.target.value)}
                      className="glass-input w-full rounded-2xl px-4 py-3"
                      placeholder="City Roast Cafe"
                    />
                  </label>
                </>
              )}

              <label className="block">
                <span className="mb-2 block text-sm text-[var(--text-secondary)]">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="glass-input w-full rounded-2xl px-4 py-3"
                  placeholder="name@company.com"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-[var(--text-secondary)]">Password</span>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="glass-input w-full rounded-2xl px-4 py-3"
                  placeholder="Enter your password"
                />
              </label>

              <GlassButton className="w-full py-3.5" disabled={loading} type="submit">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Continue to dashboard" : "Create account"}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </GlassButton>
            </form>
          </div>
        </GlassCard>
      </div>
    </AnimatedPage>
  );
}
