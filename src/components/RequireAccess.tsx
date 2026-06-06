/* ============================================================
   R7 Fortune — Access Gate
   Blocks free users who exhausted their 3 free readings.
   Redirects to /payment page. Premium users always pass.
   ============================================================ */

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  /** Pages that bypass the gate (login, payment, home, profile) */
  bypassPaths?: string[];
}

const BYPASS = ["/login", "/payment", "/", "/profile", "/admin"];

export default function RequireAccess({ children, bypassPaths = BYPASS }: Props) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current path is bypassed
  const isBypassed = bypassPaths.some(p => location.pathname === p || location.pathname.startsWith(p + "/"));

  // Fetch user's free reading count from backend
  const { data: accessData, isLoading: accessLoading } = trpc.reading.getFreeCount.useQuery(
    undefined,
    { staleTime: 1000 * 30, enabled: isAuthenticated && !isBypassed }
  );

  useEffect(() => {
    if (!isAuthenticated || isBypassed || accessLoading) return;

    // Premium user: always pass
    if (accessData?.isPremium) return;

    // Free user with remaining readings: pass
    if ((accessData?.freeReadings ?? 0) > 0) return;

    // Blocked: redirect to payment page
    if (!accessData?.canAccess) {
      localStorage.setItem("r7_blocked_from", location.pathname);
      navigate("/payment", { replace: true });
    }
  }, [isAuthenticated, isBypassed, accessLoading, accessData, navigate, location.pathname]);

  // Show nothing while checking
  if (!isAuthenticated && !isBypassed && authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#d4a853] animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
