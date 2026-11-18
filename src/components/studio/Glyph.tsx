import type { Glyph as G } from "@/lib/studio/catalog";

/** Draws an accessory top-down inside a w×h box centered on 0,0. */
export function Glyph({ glyph, w, h, fill }: { glyph: G; w: number; h: number; fill: string }) {
  const x = -w / 2, y = -h / 2;
  const line = "rgba(255,255,255,0.28)";
  const dark = "rgba(0,0,0,0.35)";
  const r = Math.min(w, h) * 0.18;
  const base = <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={dark} strokeWidth={0.8} />;
  switch (glyph) {
    case "box": return <g>{base}<rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} rx={r * 0.6} fill="none" stroke={line} strokeWidth={0.8} /><rect x={-w * 0.15} y={y + 1.5} width={w * 0.3} height={2.5} rx={1} fill={line} /></g>;
    case "underseat": return <g>{base}{[0.33, 0.66].map((t) => <line key={t} x1={x + w * t} y1={y + 3} x2={x + w * t} y2={y + h - 3} stroke={line} />)}<rect x={-w * 0.2} y={y + h - 5} width={w * 0.4} height={2.5} rx={1} fill={line} /></g>;
    case "shelf": return <g>{base}<line x1={x + 4} y1={0} x2={x + w - 4} y2={0} stroke={line} strokeWidth={1.2} />{[0.25, 0.5, 0.75].map((t) => <line key={t} x1={x + w * t} y1={y + 3} x2={x + w * t} y2={y + h - 3} stroke={line} />)}</g>;
    case "console": return <g>{base}<line x1={0} y1={y + 3} x2={0} y2={y + h - 3} stroke={line} /><line x1={x + 3} y1={0} x2={x + w - 3} y2={0} stroke={line} /></g>;
    case "door": return <g>{base}{[0.3, 0.6].map((t) => <path key={t} d={`M${x + 2} ${y + h * t} q ${w / 2} 6 ${w - 4} 0`} stroke={line} fill="none" />)}</g>;
    case "armrest": return <g><rect x={x} y={y} width={w} height={h} rx={w / 2} fill={fill} stroke={dark} strokeWidth={0.8} /><path d={`M${x + 4} ${y + h * 0.35} h ${w - 8}`} stroke={line} /><rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} rx={(w - 6) / 2} fill="none" stroke={line} strokeDasharray="1.5 1.5" /></g>;
    case "seatback": return <g>{base}{[0.25, 0.5, 0.75].map((t) => <line key={t} x1={x + w * t} y1={y + 2} x2={x + w * t} y2={y + h - 2} stroke={line} />)}</g>;
    case "footrest": return <g>{base}{Array.from({ length: 5 }, (_, i) => <line key={i} x1={x + 4} y1={y + 3 + i * ((h - 6) / 4)} x2={x + w - 4} y2={y + 3 + i * ((h - 6) / 4)} stroke={line} />)}</g>;
    case "cushion": return <g><rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} stroke={dark} strokeWidth={0.8} /><path d={`M${x + 5} 0 Q 0 ${-h * 0.4} ${x + w - 5} 0`} stroke={line} fill="none" /></g>;
    case "screen": return <g>{base}<rect x={x + 1.5} y={y + 1.5} width={w - 3} height={h - 3} rx={1} fill="#0c1a2a" /><rect x={x + 3} y={y + 2.5} width={w * 0.4} height={1} fill="#4aa3ff" opacity={0.7} /></g>;
    case "charger": return <g>{base}<circle cx={-w * 0.18} cy={0} r={Math.min(w, h) * 0.28} fill="none" stroke={line} strokeWidth={1.2} />{[0, 1, 2, 3].map((i) => <rect key={i} x={w * 0.08 + (i % 2) * 4} y={-4 + Math.floor(i / 2) * 5} width={2.6} height={3} rx={0.6} fill={line} />)}</g>;
    case "speaker": return <g><circle r={Math.min(w, h) / 2} fill={fill} stroke={dark} strokeWidth={0.8} /><circle r={Math.min(w, h) * 0.32} fill="none" stroke={line} /><circle r={Math.min(w, h) * 0.12} fill={line} /></g>;
    case "holder": return <g>{base}<circle r={Math.min(w, h) * 0.25} fill="none" stroke={line} strokeWidth={1.2} /></g>;
    case "cup": return <g>{base}<circle cx={-w / 4} r={h * 0.32} fill={dark} stroke={line} /><circle cx={w / 4} r={h * 0.32} fill={dark} stroke={line} /></g>;
    case "umbrella": return <g><rect x={x} y={y} width={w} height={h} rx={w / 2} fill={fill} stroke={dark} strokeWidth={0.8} /><line x1={0} y1={y + 4} x2={0} y2={y + h - 4} stroke={line} /></g>;
    case "tray": return <g>{base}<rect x={x + 2.5} y={y + 2.5} width={w - 5} height={h - 5} rx={r * 0.5} fill={dark} /></g>;
    case "hook": return <g><path d={`M${x} ${y} h ${w} v ${h * 0.4} a ${w / 2} ${h * 0.6} 0 0 1 ${-w} 0 z`} fill={fill} stroke={dark} strokeWidth={0.8} /><circle r={1.5} cy={y + h * 0.3} fill={line} /></g>;
  }
}

export function GlyphThumb({ glyph, w, h, fill }: { glyph: G; w: number; h: number; fill: string }) {
  const m = Math.max(w, h) * 1.25;
  return (
    <svg viewBox={`${-m / 2} ${-m / 2} ${m} ${m}`} className="h-full w-full" aria-hidden>
      <Glyph glyph={glyph} w={w} h={h} fill={fill} />
    </svg>
  );
}
