import { VEHICLES, getItem, type VehicleType } from "./catalog";
import type { PlacedItem } from "./types";

export interface Doc { vehicle: VehicleType; items: PlacedItem[] }
export interface EditorState { past: Doc[]; present: Doc; future: Doc[] }
export type Action =
  | { type: "set"; doc: Doc; record?: boolean }
  | { type: "checkpoint" }
  | { type: "undo" } | { type: "redo" }
  | { type: "reset"; doc: Doc };

export function editorReducer(s: EditorState, a: Action): EditorState {
  switch (a.type) {
    case "set": return a.record === false ? { ...s, present: a.doc } : { past: [...s.past, s.present].slice(-80), present: a.doc, future: [] };
    case "checkpoint": return { past: [...s.past, s.present].slice(-80), present: s.present, future: [] };
    case "undo": return s.past.length ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] } : s;
    case "redo": return s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s;
    case "reset": return { past: [], present: a.doc, future: [] };
  }
}

/** Keep the item's rotated footprint inside the vehicle interior. */
export function clampItem(p: PlacedItem, vehicle: VehicleType): PlacedItem {
  const b = VEHICLES[vehicle].bounds;
  const t = (p.rotation * Math.PI) / 180;
  const hw = (Math.abs(Math.cos(t)) * p.w + Math.abs(Math.sin(t)) * p.h) / 2;
  const hh = (Math.abs(Math.sin(t)) * p.w + Math.abs(Math.cos(t)) * p.h) / 2;
  const cl = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));
  return { ...p, x: cl(p.x, b.x + hw, b.x + b.w - hw), y: cl(p.y, b.y + hh, b.y + b.h - hh) };
}

export function makeItem(itemId: string, x: number, y: number, vehicle: VehicleType): PlacedItem {
  const c = getItem(itemId);
  return clampItem({ uid: crypto.randomUUID(), itemId, x, y, w: c.w, h: c.h, rotation: 0, color: c.defaultColor, material: c.defaultMaterial, quantity: 1 }, vehicle);
}
