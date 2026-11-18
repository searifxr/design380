import { useCallback, useEffect, useRef, useState } from "react";
import { Glyph } from "./Glyph";
import { VehicleSvg } from "./VehicleSvg";
import { VEHICLES, getColor, getItem, type VehicleType } from "@/lib/studio/catalog";
import { clampItem } from "@/lib/studio/editor";
import type { PlacedItem } from "@/lib/studio/types";

export interface View { k: number; x: number; y: number }
interface Props {
  vehicle: VehicleType; items: PlacedItem[]; selected: string | null; readOnly?: boolean;
  view: View; setView: (fn: (v: View) => View) => void;
  onSelect: (uid: string | null) => void;
  onBegin: () => void;
  onChange: (p: PlacedItem) => void;
  onDrop: (itemId: string, x: number, y: number) => void;
}
type Drag = { mode: "move" | "rotate" | "resize"; uid: string; dx: number; dy: number } | { mode: "pan"; sx: number; sy: number; vx: number; vy: number };

export function Canvas({ vehicle, items, selected, readOnly, view, setView, onSelect, onBegin, onChange, onDrop }: Props) {
  const v = VEHICLES[vehicle];
  const pad = 40;
  const vb = { x: -pad, y: -pad, w: v.w + pad * 2, h: v.l + pad * 2 };
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const drag = useRef<Drag | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const toLocal = useCallback((cx: number, cy: number, el: SVGGraphicsElement | null) => {
    const svg = svgRef.current; if (!svg || !el) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy;
    const m = el.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    const r = pt.matrixTransform(m.inverse()); return { x: r.x, y: r.y };
  }, []);

  const zoomAt = useCallback((cx: number, cy: number, factor: number) => {
    const p = toLocal(cx, cy, svgRef.current);
    setView((cur) => {
      const k = Math.min(4, Math.max(0.5, cur.k * factor)); const f = k / cur.k;
      return { k, x: p.x - (p.x - cur.x) * f, y: p.y - (p.y - cur.y) * f };
    });
  }, [setView, toLocal]);
  const zoomRef = useRef(zoomAt); zoomRef.current = zoomAt;

  useEffect(() => {
    const el = svgRef.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      zoomRef.current(e.clientX, e.clientY, Math.exp(-dy * 0.0015));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const byId = (uid: string) => items.find((i) => i.uid === uid);

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d) return;
    if (d.mode === "pan") {
      const svg = svgRef.current!; const s = vb.w / svg.clientWidth;
      const sc = Math.max(s, vb.h / svg.clientHeight);
      setView((cur) => ({ ...cur, x: d.vx + (e.clientX - d.sx) * sc, y: d.vy + (e.clientY - d.sy) * sc }));
      return;
    }
    const it = byId(d.uid); if (!it) return;
    const p = toLocal(e.clientX, e.clientY, groupRef.current);
    if (d.mode === "move") {
      const gx = Math.round((p.x - d.dx) / 2) * 2, gy = Math.round((p.y - d.dy) / 2) * 2;
      onChange(clampItem({ ...it, x: gx, y: gy }, vehicle));
    } else if (d.mode === "rotate") {
      let ang = (Math.atan2(p.y - it.y, p.x - it.x) * 180) / Math.PI + 90;
      ang = Math.round(ang / (e.shiftKey ? 1 : 15)) * (e.shiftKey ? 1 : 15);
      onChange(clampItem({ ...it, rotation: ((ang % 360) + 360) % 360 }, vehicle));
    } else {
      const t = (-it.rotation * Math.PI) / 180; const lx = p.x - it.x, ly = p.y - it.y;
      const rx = lx * Math.cos(t) - ly * Math.sin(t), ry = lx * Math.sin(t) + ly * Math.cos(t);
      const base = getItem(it.itemId);
      const w = Math.min(base.w * 2.5, Math.max(base.w * 0.5, Math.abs(rx) * 2));
      const h = Math.min(base.h * 2.5, Math.max(base.h * 0.5, Math.abs(ry) * 2));
      onChange(clampItem({ ...it, w: Math.round(w), h: Math.round(h) }, vehicle));
    }
  };
  const start = (e: React.PointerEvent, d: Drag) => {
    if (readOnly && d.mode !== "pan") return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    svgRef.current?.setPointerCapture(e.pointerId);
    if (d.mode !== "pan") onBegin();
    drag.current = d;
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-xl border bg-canvas transition-colors ${dragOver ? "border-primary" : "border-border"}`}
      onDragOver={(e) => { if (readOnly) return; e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragOver(false);
        const id = e.dataTransfer.getData("text/x-component"); if (!id || readOnly) return;
        const p = toLocal(e.clientX, e.clientY, groupRef.current); onDrop(id, p.x, p.y);
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        className="h-full w-full touch-none select-none"
        onPointerDown={(e) => { onSelect(null); start(e, { mode: "pan", sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y }); }}
        onPointerMove={onPointerMove}
        onPointerUp={() => { drag.current = null; }}
        role="application"
        aria-label={`${v.name} interior editor`}
      >
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0H0V10" fill="none" stroke="var(--grid)" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect x={vb.x - 2000} y={vb.y - 2000} width={vb.w + 4000} height={vb.h + 4000} fill="url(#grid)" />
        <g ref={groupRef} transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          <VehicleSvg type={vehicle} />
          {!readOnly && <rect x={v.bounds.x} y={v.bounds.y} width={v.bounds.w} height={v.bounds.h} rx={12} fill="none" stroke="var(--guide)" strokeDasharray="3 3" strokeWidth={0.6} pointerEvents="none" />}
          {items.map((it) => {
            const c = getItem(it.itemId); const sel = it.uid === selected && !readOnly;
            return (
              <g key={it.uid} transform={`translate(${it.x} ${it.y}) rotate(${it.rotation})`} className={readOnly ? "" : "cursor-move"}
                onPointerDown={(e) => {
                  if (readOnly) return;
                  onSelect(it.uid);
                  const p = toLocal(e.clientX, e.clientY, groupRef.current);
                  start(e, { mode: "move", uid: it.uid, dx: p.x - it.x, dy: p.y - it.y });
                }}>
                <g filter="drop-shadow(0 1.5px 1.5px rgba(0,0,0,.45))"><Glyph glyph={c.glyph} w={it.w} h={it.h} fill={getColor(it.color).hex} /></g>
                {it.quantity > 1 && <g transform={`translate(${it.w / 2} ${-it.h / 2})`}><circle r={5} fill="var(--primary)" /><text textAnchor="middle" dy={2.2} fontSize={6} fontWeight={700} fill="var(--primary-foreground)">{it.quantity}</text></g>}
                {sel && (<>
                  <rect x={-it.w / 2 - 2} y={-it.h / 2 - 2} width={it.w + 4} height={it.h + 4} rx={2} fill="none" stroke="var(--primary)" strokeWidth={0.9} strokeDasharray="2.5 1.5" pointerEvents="none" />
                  <line x1={0} y1={-it.h / 2 - 2} x2={0} y2={-it.h / 2 - 12} stroke="var(--primary)" strokeWidth={0.8} />
                  <circle cy={-it.h / 2 - 14} r={3.5} fill="var(--background)" stroke="var(--primary)" strokeWidth={1.2} className="cursor-grab"
                    onPointerDown={(e) => start(e, { mode: "rotate", uid: it.uid, dx: 0, dy: 0 })} />
                  {c.resizable && <rect x={it.w / 2 - 1} y={it.h / 2 - 1} width={5} height={5} fill="var(--primary)" className="cursor-nwse-resize"
                    onPointerDown={(e) => start(e, { mode: "resize", uid: it.uid, dx: 0, dy: 0 })} />}
                </>)}
              </g>
            );
          })}
        </g>
      </svg>
      {items.length === 0 && !readOnly && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 mx-auto w-fit rounded-full border border-border bg-card/90 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
          Drag a component from the library into the cabin
        </div>
      )}
    </div>
  );
}
