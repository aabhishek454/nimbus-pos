"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Loader from "@/components/Loader";
import { AuthUser, UserRole, clearSession, getDashboardRoute, getStoredToken, getStoredUser } from "@/lib/auth";

type ProtectedRouteProps = PropsWithChildren<{
  roles: UserRole[];
  loadingLabel?: string;
}>;

export default function ProtectedRoute({
  children,
  roles,
  loadingLabel = "Checking your session...",
}: ProtectedRouteProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();

    if (!token || !storedUser) {
      clearSession();
      router.replace("/");
      return;
    }

    if (!roles.includes(storedUser.role)) {
      router.replace(getDashboardRoute(storedUser.role));
      return;
    }

    setUser(storedUser);
    setAllowed(true);
  }, [roles, router]);

  if (!allowed || !user) {
    return <Loader label={loadingLabel} />;
  }

  return <>{children}</>;
}
