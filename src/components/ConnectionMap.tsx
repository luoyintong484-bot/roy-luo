import { RELATION_CONFIG } from "@/lib/compatibility-algo";

export interface ConnectionNode {
  id: number;
  name: string;
  stageName: string;
  groupName: string;
  zodiacSign: string;
  mbti: string;
  element: string;
  relationTag: string;
  score: number;
}

/** Circular connection map: user in center, idols orbiting around with colored connection lines.
 *  Pure CSS/SVG — no external dependencies. */
export default function ConnectionMap({
  userName,
  userElement,
  userZodiac,
  nodes,
  onNodeClick,
}: {
  userName: string;
  userElement: string;
  userZodiac: string;
  nodes: ConnectionNode[];
  onNodeClick?: (node: ConnectionNode) => void;
}) {
  const cx = 180, cy = 180, centerR = 30, orbitR = 120;

  // Position nodes evenly around the circle
  const positioned = nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: cx + orbitR * Math.cos(angle), y: cy + orbitR * Math.sin(angle) };
  });

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 360 360" className="w-full max-w-[360px]">
        {/* Orbit ring */}
        <circle cx={cx} cy={cy} r={orbitR} fill="none" stroke="rgba(212,168,83,0.08)" strokeWidth="1" strokeDasharray="4 6" />

        {/* Connection lines: center to each node */}
        {positioned.map((n) => {
          const cfg = RELATION_CONFIG[n.relationTag];
          return (
            <line key={`line-${n.id}`}
              x1={cx} y1={cy} x2={n.x} y2={n.y}
              stroke={cfg?.color || "#9BA3AF"} strokeWidth="1" opacity="0.4"
            />
          );
        })}

        {/* Node cards */}
        {positioned.map((n) => {
          const cfg = RELATION_CONFIG[n.relationTag];
          return (
            <g key={`node-${n.id}`}
              onClick={() => onNodeClick?.(n)}
              className="cursor-pointer"
              style={{ transition: "transform 0.2s" }}
            >
              {/* Node circle */}
              <circle cx={n.x} cy={n.y} r="24" fill="#0a0a0f" stroke={cfg?.color || "#9BA3AF"} strokeWidth="1.5" />
              {/* Emoji */}
              <text x={n.x} y={n.y - 4} textAnchor="middle" fontSize="14">{cfg?.emoji || "✨"}</text>
              {/* Score */}
              <text x={n.x} y={n.y + 12} textAnchor="middle" fontSize="7" fill="#8a8aad">{n.score}</text>
              {/* Name label below */}
              <text x={n.x} y={n.y + 36} textAnchor="middle" fontSize="8" fill="#f0e6d3">{n.stageName}</text>
              <text x={n.x} y={n.y + 46} textAnchor="middle" fontSize="7" fill="#8a8aad55">{n.zodiacSign} · {n.mbti}</text>
            </g>
          );
        })}

        {/* Center user */}
        <circle cx={cx} cy={cy} r={centerR} fill="#0a0a0f" stroke="#FFB6C1" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={centerR - 25} fill="none" stroke="rgba(255,182,193,0.15)" strokeWidth="8" />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="10" fill="#f0e6d3" fontWeight="bold">{userName}</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="7" fill="#FFB6C1">{userElement} · {userZodiac}</text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {Object.entries(RELATION_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1 text-[10px] text-[#8a8aad]">
            <span style={{ color: cfg.color }}>{cfg.emoji}</span>
            <span>{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
