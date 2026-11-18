import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Copy, Eye, FilePlus2, Maximize, Minus, Plus, Redo2, RotateCw, Save, Search, Trash2, Undo2, X, ArrowLeft, Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Canvas, type View } from "./Canvas";
import { GlyphThumb } from "./Glyph";
import { VehicleSvg } from "./VehicleSvg";
import { CATALOG, CATEGORIES, COLORS, MATERIALS, VEHICLES, getColor, getItem, getMaterial, type Category, type VehicleType } from "@/lib/studio/catalog";
import { clampItem, editorReducer, makeItem } from "@/lib/studio/editor";
import { computePricing, itemPrice, usd } from "@/lib/studio/pricing";
import { getDesign, saveDesign } from "@/lib/studio/storage";
import type { PlacedItem } from "@/lib/studio/types";

const HOME_VIEW: View = { k: 1, x: 0, y: 0 };

export function Studio({ designId }: { designId?: string }) {
  const [state, dispatch] = useReducer(editorReducer, { past: [], present: { vehicle: "sedan", items: [] }, future: [] });
  const [started, setStarted] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState("Untitled design");
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setViewState] = useState<View>(HOME_VIEW);
  const [preview, setPreview] = useState(false);
  const [pendingVehicle, setPendingVehicle] = useState<VehicleType | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const setView = useCallback((fn: (v: View) => View) => setViewState(fn), []);
  const { vehicle, items } = state.present;
  const sel = items.find((i) => i.uid === selected) ?? null;
  const pricing = useMemo(() => computePricing(items), [items]);

  useEffect(() => {
    if (!designId) return;
    const d = getDesign(designId);
    if (d) { dispatch({ type: "reset", doc: { vehicle: d.vehicle, items: d.items } }); setId(d.id); setName(d.name); setStarted(true); }
    else toast.error("That design could not be found");
  }, [designId]);

  const setItems = (next: PlacedItem[], record = true) => dispatch({ type: "set", doc: { vehicle, items: next }, record });
  const update = (p: PlacedItem, record = true) => setItems(items.map((i) => (i.uid === p.uid ? p : i)), record);
  const add = (itemId: string, x?: number, y?: number) => {
    const b = VEHICLES[vehicle].bounds;
    const p = makeItem(itemId, x ?? b.x + b.w / 2, y ?? b.y + b.h / 2, vehicle);
    setItems([...items, p]); setSelected(p.uid);
  };
  const remove = (uid: string) => { setItems(items.filter((i) => i.uid !== uid)); setSelected(null); };
  const duplicate = (p: PlacedItem) => { const c = clampItem({ ...p, uid: crypto.randomUUID(), x: p.x + 12, y: p.y + 12 }, vehicle); setItems([...items, c]); setSelected(c.uid); };

  const switchVehicle = (v: VehicleType) => {
    dispatch({ type: "set", doc: { vehicle: v, items: items.map((i) => clampItem(i, v)) } });
    setViewState(HOME_VIEW); setPendingVehicle(null);
  };
  const save = () => {
    const newId = id ?? crypto.randomUUID();
    saveDesign({ id: newId, name: name.trim() || "Untitled design", vehicle, items, updatedAt: Date.now(), total: pricing.total });
    setId(newId); toast.success("Design saved", { description: "Find it any time under My Designs." });
  };
  const newDesign = () => { dispatch({ type: "reset", doc: { vehicle, items: [] } }); setId(null); setName("Untitled design"); setSelected(null); setStarted(false); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement; if (t.closest("input,textarea,[contenteditable]")) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); dispatch({ type: e.shiftKey ? "redo" : "undo" }); }
      else if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); dispatch({ type: "redo" }); }
      else if ((e.key === "Delete" || e.key === "Backspace") && sel) { e.preventDefault(); remove(sel.uid); }
      else if (mod && e.key.toLowerCase() === "d" && sel) { e.preventDefault(); duplicate(sel); }
      else if (e.key === "Escape") { setSelected(null); setPreview(false); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });

  if (!started) return <VehiclePicker onPick={(v) => { switchVehicle(v); dispatch({ type: "reset", doc: { vehicle: v, items: [] } }); setStarted(true); }} />;

  const v = VEHICLES[vehicle];

  if (preview) {
    return (
      <div className="animate-in fade-in grid h-[calc(100dvh-4rem)] grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_360px]">
        <div className="relative min-h-[420px]">
          <Canvas vehicle={vehicle} items={items} selected={null} readOnly view={view} setView={setView} onSelect={() => {}} onBegin={() => {}} onChange={() => {}} onDrop={() => {}} />
          <Button variant="secondary" className="absolute left-4 top-4" onClick={() => setPreview(false)}><ArrowLeft /> Back to editing</Button>
        </div>
        <aside className="flex flex-col gap-4 overflow-auto rounded-xl border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Design presentation</p>
          <h2 className="font-display text-2xl">{name}</h2>
          <p className="text-sm text-muted-foreground">{v.name} · {items.length} component{items.length === 1 ? "" : "s"}</p>
          <ul className="divide-y divide-border text-sm">
            {items.map((i) => { const c = getItem(i.itemId); return (
              <li key={i.uid} className="flex items-center gap-3 py-2.5">
                <span className="h-3 w-3 rounded-full border border-border" style={{ background: getColor(i.color).hex }} />
                <span className="flex-1">{c.name}{i.quantity > 1 && ` ×${i.quantity}`}<span className="block text-xs text-muted-foreground">{getMaterial(i.material).name} · {getColor(i.color).name}</span></span>
                <span className="tabular-nums">{usd(itemPrice(i))}</span>
              </li>); })}
          </ul>
          <PriceSummary p={pricing} />
        </aside>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      <Toolbar
        name={name} setName={setName} vehicle={vehicle} onVehicle={(nv) => { if (nv === vehicle) return; items.length ? setPendingVehicle(nv) : switchVehicle(nv); }}
        canUndo={state.past.length > 0} canRedo={state.future.length > 0} onUndo={() => dispatch({ type: "undo" })} onRedo={() => dispatch({ type: "redo" })}
        onClear={() => items.length && setConfirmClear(true)} onSave={save} onPreview={() => { setSelected(null); setPreview(true); }} onNew={newDesign}
      />
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr_320px]">
        <Library onAdd={(id) => add(id)} />
        <div className="relative min-h-[480px] p-4">
          <Canvas vehicle={vehicle} items={items} selected={selected} view={view} setView={setView} onSelect={setSelected}
            onBegin={() => dispatch({ type: "checkpoint" })} onChange={(p) => update(p, false)} onDrop={(id, x, y) => add(id, x, y)} />
          <div className="absolute bottom-7 right-7 flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            <IconBtn label="Zoom in" onClick={() => setViewState((c) => zoomCenter(c, 1.25, v))}><Plus /></IconBtn>
            <IconBtn label="Zoom out" onClick={() => setViewState((c) => zoomCenter(c, 0.8, v))}><Minus /></IconBtn>
            <IconBtn label="Reset view" onClick={() => setViewState(HOME_VIEW)}><Maximize /></IconBtn>
          </div>
          <div className="absolute left-7 top-7 rounded-md bg-card/80 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur">{Math.round(view.k * 100)}%</div>
        </div>
        <Inspector sel={sel} items={items} pricing={pricing} onChange={update} onRemove={remove} onDuplicate={duplicate} onSelect={setSelected} />
      </div>

      <AlertDialog open={!!pendingVehicle} onOpenChange={(o) => !o && setPendingVehicle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to {pendingVehicle && VEHICLES[pendingVehicle].name}?</AlertDialogTitle>
            <AlertDialogDescription>Your {items.length} components will move to the new vehicle. Anything outside the new cabin will be nudged inside.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => pendingVehicle && switchVehicle(pendingVehicle)}>Switch vehicle</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Clear the whole design?</AlertDialogTitle><AlertDialogDescription>All placed components will be removed. You can undo this.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { setItems([]); setSelected(null); }}>Clear all</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function zoomCenter(c: View, f: number, v: { w: number; l: number }): View {
  const k = Math.min(4, Math.max(0.5, c.k * f)); const r = k / c.k; const px = v.w / 2, py = v.l / 2;
  return { k, x: px - (px - c.x) * r, y: py - (py - c.y) * r };
}

function IconBtn({ label, onClick, children, disabled }: { label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="grid h-9 w-9 place-items-center text-foreground transition hover:bg-secondary disabled:opacity-30 [&_svg]:h-4 [&_svg]:w-4">{children}</button>;
}

function Toolbar(p: { name: string; setName: (s: string) => void; vehicle: VehicleType; onVehicle: (v: VehicleType) => void; canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void; onClear: () => void; onSave: () => void; onPreview: () => void; onNew: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2.5">
      <Input value={p.name} onChange={(e) => p.setName(e.target.value)} aria-label="Design name" className="h-9 w-52 border-transparent bg-transparent font-medium hover:border-border focus:border-border" />
      <div className="flex rounded-lg border border-border p-0.5">
        {(Object.keys(VEHICLES) as VehicleType[]).map((v) => (
          <button key={v} type="button" onClick={() => p.onVehicle(v)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${p.vehicle === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{VEHICLES[v].name}</button>
        ))}
      </div>
      <div className="flex rounded-lg border border-border">
        <IconBtn label="Undo" onClick={p.onUndo} disabled={!p.canUndo}><Undo2 /></IconBtn>
        <IconBtn label="Redo" onClick={p.onRedo} disabled={!p.canRedo}><Redo2 /></IconBtn>
        <IconBtn label="Clear all" onClick={p.onClear}><Trash2 /></IconBtn>
      </div>
      <div className="ml-auto flex gap-2">
        <Button variant="ghost" size="sm" onClick={p.onNew}><FilePlus2 /> New</Button>
        <Button variant="outline" size="sm" onClick={p.onPreview}><Eye /> Preview</Button>
        <Button size="sm" onClick={p.onSave}><Save /> Save</Button>
      </div>
    </div>
  );
}

function Library({ onAdd }: { onAdd: (id: string) => void }) {
  const [q, setQ] = useState(""); const [cat, setCat] = useState<Category | "All">("All");
  const list = CATALOG.filter((c) => (cat === "All" || c.category === cat) && (c.name + c.description).toLowerCase().includes(q.toLowerCase()));
  return (
    <aside className="flex min-h-0 flex-col border-r border-border bg-sidebar">
      <div className="space-y-3 border-b border-border p-4">
        <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search components" className="h-9 pl-8" /></div>
        <div className="flex flex-wrap gap-1.5">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)} className={`rounded-full border px-2.5 py-1 text-[11px] transition ${cat === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>{c}</button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {list.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No components match “{q}”.</p>}
        {list.map((c) => (
          <div key={c.id} draggable onDragStart={(e) => { e.dataTransfer.setData("text/x-component", c.id); e.dataTransfer.effectAllowed = "copy"; }}
            className="group flex cursor-grab gap-3 rounded-lg border border-border bg-card p-2.5 transition hover:border-primary/50 active:cursor-grabbing">
            <div className="h-14 w-14 shrink-0 rounded-md bg-canvas p-1.5"><GlyphThumb glyph={c.glyph} w={c.w} h={c.h} fill={getColor(c.defaultColor).hex} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2"><p className="truncate text-sm font-medium">{c.name}</p><span className="text-xs tabular-nums text-primary">{usd(c.price)}</span></div>
              <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">{c.description}</p>
              <button type="button" onClick={() => onAdd(c.id)} className="mt-1 text-[11px] font-medium text-foreground/80 hover:text-primary">+ Add to vehicle</button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Inspector({ sel, items, pricing, onChange, onRemove, onDuplicate, onSelect }: {
  sel: PlacedItem | null; items: PlacedItem[]; pricing: ReturnType<typeof computePricing>;
  onChange: (p: PlacedItem) => void; onRemove: (uid: string) => void; onDuplicate: (p: PlacedItem) => void; onSelect: (uid: string) => void;
}) {
  return (
    <aside className="hidden min-h-0 flex-col overflow-y-auto border-l border-border bg-sidebar xl:flex">
      {sel ? <Props p={sel} onChange={onChange} onRemove={onRemove} onDuplicate={onDuplicate} /> : (
        <div className="border-b border-border p-5 text-sm text-muted-foreground">Select a component in the cabin to customize its color, material, size and rotation.</div>
      )}
      <div className="p-5">
        <h3 className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Configuration · {items.length}</h3>
        <ul className="mb-4 space-y-1">
          {items.map((i) => (
            <li key={i.uid}><button type="button" onClick={() => onSelect(i.uid)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-secondary ${sel?.uid === i.uid ? "bg-secondary" : ""}`}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: getColor(i.color).hex }} /><span className="flex-1 truncate">{getItem(i.itemId).name}{i.quantity > 1 && ` ×${i.quantity}`}</span><span className="text-xs tabular-nums text-muted-foreground">{usd(itemPrice(i))}</span>
            </button></li>
          ))}
          {items.length === 0 && <li className="text-sm text-muted-foreground">Nothing placed yet.</li>}
        </ul>
        <PriceSummary p={pricing} />
      </div>
    </aside>
  );
}

function Props({ p, onChange, onRemove, onDuplicate }: { p: PlacedItem; onChange: (p: PlacedItem) => void; onRemove: (uid: string) => void; onDuplicate: (p: PlacedItem) => void }) {
  const c = getItem(p.itemId);
  const commitNum = (k: "x" | "y" | "rotation" | "w" | "h", val: number) => !Number.isNaN(val) && onChange({ ...p, [k]: val });
  return (
    <div className="space-y-5 border-b border-border p-5">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-md bg-canvas p-1"><GlyphThumb glyph={c.glyph} w={p.w} h={p.h} fill={getColor(p.color).hex} /></div>
        <div className="flex-1"><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.category} · {usd(itemPrice(p))}</p></div>
        <IconBtn label="Duplicate" onClick={() => onDuplicate(p)}><Copy /></IconBtn>
        <IconBtn label="Delete" onClick={() => onRemove(p.uid)}><Trash2 /></IconBtn>
      </div>
      <Field label={`Color · ${getColor(p.color).name}`}>
        <div className="flex flex-wrap gap-2">{COLORS.map((col) => (
          <button key={col.id} type="button" aria-label={col.name} title={col.name} onClick={() => onChange({ ...p, color: col.id })}
            className={`h-7 w-7 rounded-full border-2 transition ${p.color === col.id ? "border-primary scale-110" : "border-border"}`} style={{ background: col.hex }} />
        ))}</div>
      </Field>
      <Field label="Material">
        <div className="grid grid-cols-1 gap-1">{MATERIALS.map((m) => (
          <button key={m.id} type="button" onClick={() => onChange({ ...p, material: m.id })} className={`flex justify-between rounded-md border px-3 py-1.5 text-xs transition ${p.material === m.id ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"}`}>
            <span>{m.name}</span><span className="text-muted-foreground">{m.surcharge ? `+${usd(m.surcharge)}` : "Included"}</span>
          </button>
        ))}</div>
      </Field>
      <Field label={`Rotation · ${Math.round(p.rotation)}°`}>
        <div className="flex items-center gap-2">
          <Slider value={[p.rotation]} min={0} max={359} step={1} onValueChange={([r]) => onChange(clampItem({ ...p, rotation: r }, "truck"))} className="flex-1" />
          <IconBtn label="Rotate 90°" onClick={() => onChange({ ...p, rotation: (p.rotation + 90) % 360 })}><RotateCw /></IconBtn>
        </div>
      </Field>
      {c.resizable && (
        <Field label="Size (cm)">
          <div className="grid grid-cols-2 gap-2">
            <NumIn label="W" value={p.w} onChange={(n) => commitNum("w", Math.min(c.w * 2.5, Math.max(c.w * 0.5, n)))} />
            <NumIn label="L" value={p.h} onChange={(n) => commitNum("h", Math.min(c.h * 2.5, Math.max(c.h * 0.5, n)))} />
          </div>
        </Field>
      )}
      <Field label="Position">
        <div className="grid grid-cols-2 gap-2"><NumIn label="X" value={p.x} onChange={(n) => commitNum("x", n)} /><NumIn label="Y" value={p.y} onChange={(n) => commitNum("y", n)} /></div>
      </Field>
      <Field label="Quantity">
        <div className="flex w-fit items-center rounded-md border border-border">
          <IconBtn label="Decrease" disabled={p.quantity <= 1} onClick={() => onChange({ ...p, quantity: p.quantity - 1 })}><Minus /></IconBtn>
          <span className="w-8 text-center text-sm tabular-nums">{p.quantity}</span>
          <IconBtn label="Increase" disabled={p.quantity >= 8} onClick={() => onChange({ ...p, quantity: p.quantity + 1 })}><Plus /></IconBtn>
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>{children}</div>;
}
function NumIn({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return <label className="flex items-center gap-2 rounded-md border border-border px-2"><span className="text-[11px] text-muted-foreground">{label}</span><input type="number" value={Math.round(value)} onChange={(e) => onChange(Number(e.target.value))} className="h-8 w-full bg-transparent text-sm tabular-nums outline-none" /></label>;
}

export function PriceSummary({ p }: { p: ReturnType<typeof computePricing> }) {
  const row = (l: string, v: number) => <div className="flex justify-between text-sm"><span className="text-muted-foreground">{l}</span><span className="tabular-nums">{usd(v)}</span></div>;
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-4">
      {row("Components", p.subtotal)}
      {row("Customization & design", p.customization)}
      {row(`Installation (~${Math.round(p.minutes / 6) / 10} h)`, p.installation)}
      <div className="flex items-baseline justify-between border-t border-border pt-2"><span className="text-sm font-medium">Estimated total</span><span className="font-display text-xl tabular-nums text-primary">{usd(p.total)}</span></div>
      <p className="text-[11px] leading-snug text-muted-foreground">All prices are estimates for planning only. Final quotes depend on your vehicle and installer.</p>
    </div>
  );
}

function VehiclePicker({ onPick }: { onPick: (v: VehicleType) => void }) {
  return (
    <div className="animate-in fade-in mx-auto max-w-6xl px-6 py-14">
      <p className="text-xs uppercase tracking-[0.22em] text-primary">Step 1 of 2</p>
      <h1 className="mt-2 font-display text-4xl">Choose your vehicle</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">Each layout is drawn to scale so components fit like they would in your car.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {(Object.values(VEHICLES)).map((v) => (
          <button key={v.id} type="button" onClick={() => onPick(v.id)} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-2xl">
            <div className="flex h-72 items-center justify-center bg-canvas p-4">
              <svg viewBox={`-20 -20 ${v.w + 40} ${v.l + 40}`} className="h-full -rotate-90 transition duration-500 group-hover:scale-105" style={{ width: "auto" }}><VehicleSvg type={v.id} /></svg>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-5">
              <div className="flex items-center justify-between"><h3 className="font-display text-xl">{v.name}</h3><span className="text-xs text-muted-foreground">{v.tagline}</span></div>
              <p className="text-sm text-muted-foreground">{v.description}</p>
              <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Car className="h-4 w-4" /> Select vehicle</span>
            </div>
          </button>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">Have a saved design? <Link to="/designs" className="text-primary underline-offset-4 hover:underline">Open My Designs</Link></p>
    </div>
  );
}
export { X };
