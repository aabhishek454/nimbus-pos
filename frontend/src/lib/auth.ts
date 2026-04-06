export type UserRole = "employee" | "owner" | "admin";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = "token";
const USER_KEY = "auth_user";

export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "owner":
      return "/owner/dashboard";
    default:
      return "/employee/dashboard";
  }
}

function getActiveRoleKeySuffix(): string {
  if (typeof window === "undefined") return "employee";
  const path = window.location.pathname;
  if (path.includes("/admin")) return "admin";
  if (path.includes("/owner")) return "owner";
  return "employee";
}

export function persistSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") {
    return;
  }

  const suffix = user.role;
  localStorage.setItem(`token_${suffix}`, token);
  localStorage.setItem(`auth_user_${suffix}`, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  const suffix = getActiveRoleKeySuffix();
  localStorage.removeItem(`token_${suffix}`);
  localStorage.removeItem(`auth_user_${suffix}`);
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const suffix = getActiveRoleKeySuffix();
  return localStorage.getItem(`token_${suffix}`);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const suffix = getActiveRoleKeySuffix();
  const raw = localStorage.getItem(`auth_user_${suffix}`);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    clearSession();
    return null;
  }
}
