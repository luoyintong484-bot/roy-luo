import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";

interface Option {
  id: number | string;
  label: string;
  sub?: string;         // secondary line (e.g. group name)
  heat?: number;        // CP heat score for sorting
}

/** Real-time searchable dropdown — replaces plain <select> across IDOL pages.
 *  Supports type-to-filter, heat-based sorting, multi-source search (name/group/CP tag/keyword). */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: {
  options: Option[];
  value: string | number | null;
  onChange: (id: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort: by heat descending, then alphabetically
  const sorted = [...options].sort((a, b) => (b.heat || 0) - (a.heat || 0) || a.label.localeCompare(b.label));

  const filtered = query.trim()
    ? sorted.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.sub || "").toLowerCase().includes(query.toLowerCase())
      )
    : sorted;

  const selected = options.find(o => String(o.id) === String(value));

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => { setOpen(!open); if (!open) setTimeout(() => inputRef.current?.focus(), 50); }}
        className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] transition-colors flex items-center justify-between gap-2 text-left"
      >
        <span className={selected ? "text-[#f0e6d3]" : "text-[#8a8aad44]"}>
          {selected ? (selected.sub ? `${selected.label} · ${selected.sub}` : selected.label) : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#8a8aad44] transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#14142a] border border-[#d4a85333] rounded-lg shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-[#d4a85310]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#0a0a0f] rounded-md pl-8 pr-8 py-2 text-xs text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none"
                onKeyDown={e => { if (e.key === "Escape") { setOpen(false); setQuery(""); } }}
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8a8aad44] hover:text-[#8a8aad]">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-[10px] text-[#8a8aad44] text-center py-4">No results found</p>
            ) : (
              filtered.map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => { onChange(String(o.id)); setOpen(false); setQuery(""); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#d4a85310] transition-colors flex items-center justify-between ${
                    String(o.id) === String(value) ? "bg-[#d4a85308] text-[#d4a853]" : "text-[#f0e6d3]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="truncate">{o.label}</span>
                    {o.sub && <span className="text-[9px] text-[#8a8aad44] ml-1.5">{o.sub}</span>}
                  </div>
                  {o.heat != null && o.heat > 0 && (
                    <span className="text-[8px] text-[#FFB6C1] ml-2 flex-shrink-0">
                      🔥{o.heat}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
