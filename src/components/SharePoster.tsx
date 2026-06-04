import { useEffect, useRef, useCallback, useState } from "react";
import { Download, X } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { renderPosterToCanvas } from "@/lib/share-utils";

/* ============================================================
   R7 Fortune — Share Poster v3
   测测-aligned 9:16 CP poster · 4-tier gradient · bilingual
   ============================================================ */

export interface PosterData {
  title: string;
  subtitle: string;
  score: string;
  tier: number;
  tierColor: string;
  tierGlow: string;
  tierGrad: [string, string];
  label: string;
  tagline: string;
  essays: string[];
  leftName: string;
  rightName: string;
}

interface Props {
  data: PosterData;
  visible: boolean;
  onClose: () => void;
}

const W = 540;
const H = 960;

export default function SharePoster({ data, visible, onClose }: Props) {
  const { locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const isZh = locale === "zh-TW";

  const drawPoster = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rendered = renderPosterToCanvas(data);
    canvas.width = rendered.width;
    canvas.height = rendered.height;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.drawImage(rendered, 0, 0);
    setReady(true);
  }, [data]);

  useEffect(() => {
    if (visible) { setReady(false); const t = setTimeout(drawPoster, 40); return () => clearTimeout(t); }
  }, [visible, drawPoster]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `R7Fortune_${data.title.replace(/[^a-zA-Z0-9一-鿿]/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000]/85 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex flex-col items-center gap-3 max-h-[95vh] overflow-y-auto animate-fade-in-up">
        <button onClick={onClose} className="self-end -mb-1 text-[#8a8aad] hover:text-[#f0e6d3] transition-colors">
          <X className="w-5 h-5" />
        </button>

        <canvas
          ref={canvasRef}
          className="rounded-2xl shadow-2xl shadow-black/50 border border-[#FFB6C108]"
          style={{ width: Math.min(W, window.innerWidth * 0.85), height: "auto", aspectRatio: "9/16" }}
        />

        <div className="flex gap-3">
          <button onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-[#0a0a0f] hover:opacity-90 transition-opacity"
            style={{ background: `linear-gradient(135deg, ${data.tierGrad[0]}, ${data.tierGrad[1]})` }}>
            <Download className="w-4 h-4" /> {isZh ? "儲存海報" : "Save Poster"}
          </button>
          <button onClick={onClose}
            className="px-6 py-3 glass rounded-xl text-sm text-[#8a8aad] border border-[#FFB6C110] hover:text-[#f0e6d3] transition-colors">
            {isZh ? "關閉" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
