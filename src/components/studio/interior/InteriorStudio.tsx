import { useEffect, useMemo, useState } from "react";
import {
  Armchair, ArrowLeft, CarFront, DoorOpen, Gauge, Lightbulb, Puzzle, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { COLORS, VEHICLES, type VehicleType } from "@/lib/studio/catalog";
import {
  INTERIOR_MATERIALS,
  componentsForVehicle,
  createDefaultInterior,
  materialPreset,
  resetComponentStyle,
  updateComponentStyle,
  type InteriorCategory,
  type InteriorComponentId,
  type InteriorCustomization,
} from "@/lib/studio/interior";
import { usd, type computePricing } from "@/lib/studio/pricing";
import { CabinViewer, type CameraPreset } from "./CabinViewer";

type PanelSelection = InteriorComponentId | "lighting" | "accessories";
const CATEGORIES: Array<{ id: InteriorCategory; icon: typeof Armchair }> = [
  { id: "Seats", icon: Armchair },
  { id: "Doors", icon: DoorOpen },
  { id: "Dashboard", icon: Gauge },
  { id: "Cabin", icon: CarFront },
];

export function InteriorStudio({ vehicle, value, onChange, pricing, preview = false, onExitPreview }: {
  vehicle: VehicleType;
  value: InteriorCustomization;
  onChange: (next: InteriorCustomization) => void;
  pricing: ReturnType<typeof computePricing>;
  preview?: boolean;
  onExitPreview?: () => void;
}) {
  const [selected, setSelected] = useState<PanelSelection>("driverSeat");
  const [category, setCategory] = useState<InteriorCategory>("Seats");
  const [preset, setPreset] = useState<CameraPreset>("cabin");
  const components = useMemo(() => componentsForVehicle(vehicle), [vehicle]);

  useEffect(() => {
    if (selected !== "lighting" && selected !== "accessories" && !components.some((c) => c.id === selected)) {
      setSelected("driverSeat");
      setCategory("Seats");
    }
  }, [components, selected]);

  const selectComponent = (id: InteriorComponentId) => {
    setSelected(id);
    const match = components.find((component) => component.id === id);
    if (match) setCategory(match.category);
  };

  if (preview) {
    const changed = components.filter((component) => (
      JSON.stringify(value.components[component.id]) !== JSON.stringify(createDefaultInterior().components[component.id])
    )).length;
    const accessories = Object.entries(value.accessories).filter(([, accessory]) => (
      typeof accessory === "boolean" ? accessory : accessory.enabled
    )).length;
    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col gap-4 p-4">
        <div><Button variant="secondary" onClick={onExitPreview}><ArrowLeft /> Back to editing</Button></div>
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_340px] lg:overflow-hidden">
          <CabinViewer vehicle={vehicle} customization={value} selected={null} onSelect={() => {}} preset={preset} onPresetChange={setPreset} />
          <aside className="space-y-5 overflow-y-auto rounded-xl border border-border bg-sidebar p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">3D design presentation</p>
              <h2 className="mt-2 font-display text-3xl">{VEHICLES[vehicle].name} interior</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Explore the cabin with the camera presets, or drag to inspect every finish.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-card p-4"><p className="text-2xl font-display text-primary">{changed}</p><p className="mt-1 text-xs text-muted-foreground">Customized components</p></div>
              <div className="rounded-lg border border-border bg-card p-4"><p className="text-2xl font-display text-primary">{accessories}</p><p className="mt-1 text-xs text-muted-foreground">Active accessories</p></div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-baseline justify-between"><span className="text-sm">Layout accessories estimate</span><span className="font-display text-xl text-primary">{usd(pricing.total)}</span></div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">This estimate covers parts placed in the top-down layout. Interior finish changes are saved with your design.</p>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[250px_minmax(0,1fr)_310px] lg:overflow-hidden">
      <aside className="order-2 flex flex-col border-r border-border bg-sidebar lg:order-1 lg:min-h-0">
        <div className="border-b border-border p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-primary">Interior studio</p>
          <h2 className="mt-1 font-display text-xl">{VEHICLES[vehicle].name} cabin</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Choose a category, then click a part here or in the 3D cabin.</p>
        </div>
        <div className="grid grid-cols-4 gap-1 border-b border-border p-2 lg:grid-cols-2">
          {CATEGORIES.map(({ id, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setCategory(id)} className={`flex items-center justify-center gap-2 rounded-md px-2 py-2 text-xs transition lg:justify-start ${category === id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}>
              <Icon className="h-4 w-4" /><span className="hidden sm:inline">{id}</span>
            </button>
          ))}
        </div>
        <div className="space-y-1 p-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {components.filter((component) => component.category === category).map((component) => {
            const style = value.components[component.id];
            return (
              <button key={component.id} type="button" onClick={() => selectComponent(component.id)} className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${selected === component.id ? "border-primary/60 bg-primary/5" : "border-transparent hover:bg-secondary"}`}>
                <span className="h-7 w-7 shrink-0 rounded-md border border-border shadow-inner" style={{ background: style.color }} />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm">{component.name}</span><span className="block truncate text-[11px] text-muted-foreground">{materialPreset(style.material).name}</span></span>
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-border p-3">
          <button type="button" onClick={() => setSelected("lighting")} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs transition ${selected === "lighting" ? "border-primary/60 bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-secondary"}`}><Lightbulb className="h-4 w-4 text-primary" /> Lighting</button>
          <button type="button" onClick={() => setSelected("accessories")} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs transition ${selected === "accessories" ? "border-primary/60 bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-secondary"}`}><Puzzle className="h-4 w-4 text-primary" /> Accessories</button>
        </div>
      </aside>

      <main className="order-1 min-h-[540px] p-3 lg:order-2 lg:min-h-0">
        <CabinViewer vehicle={vehicle} customization={value} selected={selected === "lighting" || selected === "accessories" ? null : selected} onSelect={selectComponent} preset={preset} onPresetChange={setPreset} />
      </main>

      <aside className="order-3 flex flex-col border-l border-border bg-sidebar lg:min-h-0">
        <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {selected === "lighting" ? (
            <LightingPanel value={value} onChange={onChange} />
          ) : selected === "accessories" ? (
            <AccessoriesPanel value={value} onChange={onChange} />
          ) : (
            <ComponentPanel id={selected} value={value} onChange={onChange} />
          )}
        </div>
        <div className="border-t border-border p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Live configuration</p>
          <div className="mt-2 flex items-center justify-between text-sm"><span>{components.length} customizable parts</span><span className="text-primary">{Math.round(value.lighting.frontBrightness * 100)}% light</span></div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Finishes, lighting and 3D accessories are included when you save this design.</p>
        </div>
      </aside>
    </div>
  );
}

function ComponentPanel({ id, value, onChange }: { id: InteriorComponentId; value: InteriorCustomization; onChange: (next: InteriorCustomization) => void }) {
  const components = componentsForVehicle("suv");
  const meta = components.find((component) => component.id === id)!;
  const style = value.components[id];
  const update = (patch: Partial<typeof style>) => onChange(updateComponentStyle(value, id, patch));
  const twoTone = meta.category === "Seats" || id === "doorLeft" || id === "doorRight" || id === "centerConsole" || id === "steeringWheel";
  const stitching = meta.category === "Seats" || id === "armrestLeft" || id === "armrestRight";
  return (
    <div className="space-y-5 p-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.17em] text-primary">{meta.category}</p>
        <h3 className="mt-1 font-display text-xl">{meta.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">Changes apply only to this component.</p>
      </div>
      <ColorField label="Main color" value={style.color} onChange={(color) => update({ color })} />
      {twoTone && <ColorField label="Two-tone insert" value={style.secondaryColor} onChange={(secondaryColor) => update({ secondaryColor })} />}
      {stitching && <ColorField label="Stitching & piping" value={style.stitchingColor} onChange={(stitchingColor) => update({ stitchingColor })} />}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Material & finish</p>
        <div className="grid grid-cols-2 gap-1.5">
          {INTERIOR_MATERIALS.map((material) => (
            <button key={material.id} type="button" onClick={() => update({ material: material.id, roughness: material.roughness })} className={`rounded-md border px-2.5 py-2 text-left text-[11px] transition ${style.material === material.id ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>{material.name}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 flex justify-between text-[11px] uppercase tracking-[0.16em] text-muted-foreground"><span>Roughness</span><span>{Math.round(style.roughness * 100)}%</span></div>
        <Slider aria-label="Material roughness" value={[style.roughness * 100]} min={5} max={100} step={1} onValueChange={([roughness]) => update({ roughness: (roughness ?? 60) / 100 })} />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>Gloss</span><span>Matte</span></div>
      </div>
      <Button variant="outline" size="sm" className="w-full" onClick={() => onChange(resetComponentStyle(value, id))}><RotateCcw /> Reset this component</Button>
    </div>
  );
}

function LightingPanel({ value, onChange }: { value: InteriorCustomization; onChange: (next: InteriorCustomization) => void }) {
  const light = value.lighting;
  const update = (patch: Partial<typeof light>) => onChange({ ...value, lighting: { ...light, ...patch } });
  return (
    <div className="space-y-5 p-5">
      <div><p className="text-[11px] uppercase tracking-[0.17em] text-primary">Ambient illumination</p><h3 className="mt-1 font-display text-xl">Interior lighting</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Colored light illuminates the cabin, not just the decorative strips.</p></div>
      <ToggleRow label="Ambient lighting" description="Master lighting switch" checked={light.enabled} onCheckedChange={(enabled) => update({ enabled })} />
      <div className={light.enabled ? "space-y-5" : "pointer-events-none space-y-5 opacity-40"}>
        <ColorField label="Front light color" value={light.frontColor} onChange={(frontColor) => update({ frontColor })} />
        <Brightness label="Front brightness" value={light.frontBrightness} onChange={(frontBrightness) => update({ frontBrightness })} />
        <ColorField label="Rear light color" value={light.rearColor} onChange={(rearColor) => update({ rearColor })} />
        <Brightness label="Rear brightness" value={light.rearBrightness} onChange={(rearBrightness) => update({ rearBrightness })} />
        <div className="space-y-3 border-t border-border pt-4">
          <ToggleRow label="Door strips" checked={light.doorStrips} onCheckedChange={(doorStrips) => update({ doorStrips })} />
          <ToggleRow label="Dashboard strip" checked={light.dashboardStrip} onCheckedChange={(dashboardStrip) => update({ dashboardStrip })} />
          <ToggleRow label="Footwell lighting" checked={light.footwell} onCheckedChange={(footwell) => update({ footwell })} />
          <ToggleRow label="Overhead cabin light" checked={light.overhead} onCheckedChange={(overhead) => update({ overhead })} />
        </div>
      </div>
    </div>
  );
}

function AccessoriesPanel({ value, onChange }: { value: InteriorCustomization; onChange: (next: InteriorCustomization) => void }) {
  const accessories = value.accessories;
  const update = (patch: Partial<typeof accessories>) => onChange({ ...value, accessories: { ...accessories, ...patch } });
  const screen = (key: "screenLeft" | "screenRight", label: string) => {
    const item = accessories[key];
    return (
      <div className="space-y-4 rounded-lg border border-border bg-card p-3">
        <ToggleRow label={label} description="Mounted behind the front headrest" checked={item.enabled} onCheckedChange={(enabled) => update({ [key]: { ...item, enabled } })} />
        {item.enabled && (
          <>
            <ToggleRow label="Screen power" checked={item.on} onCheckedChange={(on) => update({ [key]: { ...item, on } })} />
            <div><p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Screen size</p><div className="grid grid-cols-3 gap-1">{([9, 11, 13] as const).map((size) => <button key={size} type="button" onClick={() => update({ [key]: { ...item, size } })} className={`rounded-md border px-2 py-1.5 text-xs ${item.size === size ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"}`}>{size} in</button>)}</div></div>
            <ColorField label="Frame color" value={item.frameColor} onChange={(frameColor) => update({ [key]: { ...item, frameColor } })} />
          </>
        )}
      </div>
    );
  };
  return (
    <div className="space-y-4 p-5">
      <div><p className="text-[11px] uppercase tracking-[0.17em] text-primary">Visible upgrades</p><h3 className="mt-1 font-display text-xl">3D accessories</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Every enabled accessory appears in the cabin.</p></div>
      {screen("screenLeft", "Driver rear screen")}
      {screen("screenRight", "Passenger rear screen")}
      <div className="space-y-3 border-t border-border pt-4">
        <ToggleRow label="Wireless charging pad" description="On the center console" checked={accessories.chargingPad} onCheckedChange={(chargingPad) => update({ chargingPad })} />
        <ToggleRow label="Custom floor mats" description="Front and rear footwells" checked={accessories.floorMats} onCheckedChange={(floorMats) => update({ floorMats })} />
        <ToggleRow label="Door sill lighting" checked={accessories.doorSillLighting} onCheckedChange={(doorSillLighting) => update({ doorSillLighting })} />
        <ToggleRow label="Cupholder lighting" checked={accessories.cupholderLighting} onCheckedChange={(cupholderLighting) => update({ cupholderLighting })} />
        <ToggleRow label="Additional USB ports" description="Rear of the center console" checked={accessories.usbPorts} onCheckedChange={(usbPorts) => update({ usbPorts })} />
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) {
  const [hex, setHex] = useState(value);
  useEffect(() => setHex(value), [value]);
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <div className="mb-2 flex flex-wrap gap-2">
        {COLORS.map((color) => (
          <button key={color.id} type="button" aria-label={`${label}: ${color.name}`} title={color.name} onClick={() => onChange(color.hex)} className={`h-7 w-7 rounded-full border-2 transition ${value.toLowerCase() === color.hex.toLowerCase() ? "scale-110 border-primary" : "border-border"}`} style={{ background: color.hex }} />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="relative h-9 w-11 shrink-0 overflow-hidden rounded-md border border-border" title="Choose a custom color">
          <input type="color" aria-label={`${label} color picker`} value={value} onChange={(event) => onChange(event.target.value)} className="absolute inset-0 h-full w-full cursor-pointer" />
        </label>
        <Input aria-label={`${label} HEX`} value={hex} maxLength={7} onChange={(event) => { setHex(event.target.value); if (/^#[0-9a-fA-F]{6}$/.test(event.target.value)) onChange(event.target.value); }} onBlur={() => setHex(value)} className="h-9 font-mono text-xs uppercase" />
      </div>
    </div>
  );
}

function Brightness({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <div><div className="mb-2 flex justify-between text-[11px] uppercase tracking-[0.16em] text-muted-foreground"><span>{label}</span><span>{Math.round(value * 100)}%</span></div><Slider aria-label={label} value={[value * 100]} min={5} max={100} step={1} onValueChange={([next]) => onChange((next ?? 50) / 100)} /></div>;
}

function ToggleRow({ label, description, checked, onCheckedChange }: { label: string; description?: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-3"><span><span className="block text-sm">{label}</span>{description && <span className="mt-0.5 block text-[11px] text-muted-foreground">{description}</span>}</span><Switch aria-label={label} checked={checked} onCheckedChange={onCheckedChange} /></label>;
}
