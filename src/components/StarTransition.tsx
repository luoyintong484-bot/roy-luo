import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface StarTransitionProps {
  targetPath: string;
  active: boolean;
  onComplete?: () => void;
}

export default function StarTransition({ targetPath, active, onComplete }: StarTransitionProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "expanding" | "transitioning" | "collapsing">("idle");

  useEffect(() => {
    if (!active || phase !== "idle") return;
    setPhase("expanding");
    const t1 = setTimeout(() => setPhase("transitioning"), 600);
    const t2 = setTimeout(() => {
      navigate(targetPath);
      setPhase("collapsing");
    }, 800);
    const t3 = setTimeout(() => {
      setPhase("idle");
      onComplete?.();
    }, 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  if (phase === "idle") return null;

  const opacity = phase === "expanding" ? 1 : phase === "transitioning" ? 1 : 0;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
      style={{ opacity, transition: "opacity 0.6s ease" }}>
      <div
        className="rounded-full"
        style={{
          width: phase === "expanding" ? "300vmax" : "0vmax",
          height: phase === "expanding" ? "300vmax" : "0vmax",
          background: "radial-gradient(circle, rgba(212,168,83,0.3) 0%, rgba(10,10,15,0.95) 40%, rgba(10,10,15,1) 60%)",
          transition: "width 0.6s ease-out, height 0.6s ease-out",
        }}
      />
      {phase === "expanding" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#d4a853] animate-ping" />
          <div className="absolute w-24 h-24 rounded-full border border-[#d4a85333] animate-ping" style={{ animationDuration: "1.2s" }} />
          <div className="absolute w-48 h-48 rounded-full border border-[#d4a85311] animate-ping" style={{ animationDuration: "1.5s" }} />
        </div>
      )}
    </div>
  );
}
