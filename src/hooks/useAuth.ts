import { trpc } from "@/providers/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { LOGIN_PATH } from "@/const";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

const AUTH_KEY = "r7_auth_user";
// ⚠️ PRODUCTION: Remove MOCK_USER entirely and use real backend auth (api/auth-router.ts).
// The mock user bypasses all authentication — only safe for local development.
const ALLOW_MOCK_AUTH = false; // false=生产模式, true=开发测试
const MOCK_USER = {
  id: 1,
  email: "test@r7fortune.com",
  name: "R7 Test User",
  avatar: null as string | null,
  freeReadings: 3,
  isPremium: false,
  freeDivineTimes: 0,
  inviteSuccessCount: 0,
  inviteUnlockTimes: 0,
  membershipType: "monthly" as const,
};

function getStoredUser() {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (ALLOW_MOCK_AUTH && stored === "logged_in") return MOCK_USER;
  } catch {}
  return null;
}

export function login(email?: string, password?: string): boolean {
  // Test login: accept any email/password
  localStorage.setItem(AUTH_KEY, "logged_in");
  window.dispatchEvent(new Event("r7-auth-change"));
  return true;
}

export function register(email?: string, password?: string, name?: string): boolean {
  // Test register: accept any input
  localStorage.setItem(AUTH_KEY, "logged_in");
  if (name) {
    MOCK_USER.name = name;
  }
  window.dispatchEvent(new Event("r7-auth-change"));
  return true;
}

export function logoutUser(): void {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("r7-auth-change"));
}

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH } =
    options ?? {};

  const navigate = useNavigate();
  const location = useLocation();
  const utils = trpc.useUtils();

  const [user, setUser] = useState<typeof MOCK_USER | null>(getStoredUser);

  // Listen for auth changes from other components
  useEffect(() => {
    const handler = () => setUser(getStoredUser());
    window.addEventListener("r7-auth-change", handler);
    return () => window.removeEventListener("r7-auth-change", handler);
  }, []);

  const mergeInvites = trpc.reading.mergeGuestInvites.useMutation();

  const logout = useCallback(() => {
    logoutUser();
  }, []);

  // Auto-merge guest invite data on login
  useEffect(() => {
    if (user) {
      mergeInvites.mutateAsync().catch(() => {});
    }
  }, [!!user]);

  useEffect(() => {
    if (redirectOnUnauthenticated && !user) {
      const currentPath = location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [redirectOnUnauthenticated, user, navigate, redirectPath]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
      logout,
      refresh: () => {},
    }),
    [user, logout],
  );
}
