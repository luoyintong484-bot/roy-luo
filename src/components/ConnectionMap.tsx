import { RELATION_CONFIG } from "@/lib/compatibility-algo";

export interface ConnectionNode {
  id: number;
  name: string;
  stageName: string;
  groupName: string;
  zodiacSign: string;
  element: string;
  relationTag: string;
  score: number;
}

export default function ConnectionMap({
  userName, userElement, userZodiac, nodes, onNodeClick,
}: {
  userName: string; userElement: string; userZodiac: string;
  nodes: ConnectionNode[]; onNodeClick?: (node: ConnectionNode) => void;
}) {
  const cx = 500, cy = 400, centerR = 60, orbitR = 300;

  const positioned = nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: cx + orbitR * Math.cos(angle), y: cy + orbitR * Math.sin(angle) };
  });

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 1000 800" className="w-full max-w-[500px] sm:max-w-[600px]">
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(212,168,83,0.06)" />
            <stop offset="100%" stopColor="rgba(10,10,15,0)" />
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {/* Background glow */}
        <circle cx={cx} cy={cy} r="380" fill="url(#bgGrad)" />

        {/* Decorative rings */}
        <circle cx={cx} cy={cy} r={orbitR} fill="none" stroke="rgba(212,168,83,0.08)" strokeWidth="2" strokeDasharray="8 10" />
        <circle cx={cx} cy={cy} r={orbitR - 40} fill="none" stroke="rgba(255,182,193,0.05)" strokeWidth="1" strokeDasharray="3 7" />
        <circle cx={cx} cy={cy} r={orbitR + 40} fill="none" stroke="rgba(212,168,83,0.05)" strokeWidth="1" strokeDasharray="4 12" />

        {/* Connection lines */}
        {positioned.map((n) => {
          const cfg = RELATION_CONFIG[n.relationTag];
          return (
            <line key={`line-${n.id}`} x1={cx} y1={cy} x2={n.x} y2={n.y}
              stroke={cfg?.color || "#9BA3AF"} strokeWidth="2.5" opacity="0.35"
            />
          );
        })}

        {/* Node cards */}
        {positioned.map((n) => {
          const cfg = RELATION_CONFIG[n.relationTag];
          return (
            <g key={`node-${n.id}`} onClick={() => onNodeClick?.(n)} className="cursor-pointer">
              <circle cx={n.x} cy={n.y} r="50" fill="#0a0a0f" stroke={cfg?.color || "#9BA3AF"} strokeWidth="2.5" filter="url(#glow)" />
              <text x={n.x} y={n.y - 10} textAnchor="middle" fontSize="28">{cfg?.emoji || "✨"}</text>
              <text x={n.x} y={n.y + 22} textAnchor="middle" fontSize="15" fontWeight="bold" fill="#f0e6d3">{n.score}</text>
              <text x={n.x} y={n.y + 65} textAnchor="middle" fontSize="16" fill="#f0e6d3" fontWeight="bold">{n.stageName}</text>
              <text x={n.x} y={n.y + 84} textAnchor="middle" fontSize="14" fill="#8a8aad">{n.zodiacSign} · {n.element}</text>
            </g>
          );
        })}

        {/* Center user */}
        <circle cx={cx} cy={cy} r={centerR} fill="#0a0a0f" stroke="#FFB6C1" strokeWidth="3" filter="url(#glow)" />
        <circle cx={cx} cy={cy} r={centerR - 8} fill="none" stroke="rgba(255,182,193,0.12)" strokeWidth="14" />
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="22" fill="#f0e6d3" fontWeight="bold">{userName}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="16" fill="#FFB6C1">{userElement} · {userZodiac}</text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {Object.entries(RELATION_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1 text-sm text-[#8a8aad]">
            <span className="text-lg" style={{ color: cfg.color }}>{cfg.emoji}</span>
            <span>{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
