import type { Design } from "./types";
const KEY = "design380.designs";
export function listDesigns(): Design[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(d: Design[]) { localStorage.setItem(KEY, JSON.stringify(d)); }
export function saveDesign(d: Design) {
  const all = listDesigns().filter((x) => x.id !== d.id);
  write([{ ...d, updatedAt: Date.now() }, ...all]);
}
export function getDesign(id: string) { return listDesigns().find((d) => d.id === id); }
export function deleteDesign(id: string) { write(listDesigns().filter((d) => d.id !== id)); }
export function duplicateDesign(id: string) {
  const d = getDesign(id); if (!d) return;
  saveDesign({ ...d, id: crypto.randomUUID(), name: `${d.name} (copy)` });
}
