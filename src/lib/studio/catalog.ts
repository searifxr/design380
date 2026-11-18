export type VehicleType = "sedan" | "suv" | "truck";
export type Category = "Storage" | "Comfort" | "Technology" | "Convenience";
export type Glyph =
  | "box" | "underseat" | "shelf" | "console" | "door"
  | "armrest" | "seatback" | "footrest" | "cushion"
  | "screen" | "charger" | "speaker" | "holder"
  | "cup" | "umbrella" | "tray" | "hook";

export interface Material { id: string; name: string; surcharge: number }
export const MATERIALS: Material[] = [
  { id: "abs", name: "Molded ABS", surcharge: 0 },
  { id: "fabric", name: "Woven fabric", surcharge: 15 },
  { id: "alcantara", name: "Alcantara", surcharge: 45 },
  { id: "leather", name: "Nappa leather", surcharge: 60 },
  { id: "carbon", name: "Carbon weave", surcharge: 85 },
];

export const COLORS = [
  { id: "onyx", name: "Onyx", hex: "#1f1f22" },
  { id: "graphite", name: "Graphite", hex: "#4a4a50" },
  { id: "sand", name: "Sand", hex: "#c9b48f" },
  { id: "cognac", name: "Cognac", hex: "#8a4b2a" },
  { id: "oxblood", name: "Oxblood", hex: "#5c1f24" },
  { id: "sage", name: "Sage", hex: "#7d8a72" },
  { id: "ivory", name: "Ivory", hex: "#e8e1d3" },
];

export interface CatalogItem {
  id: string; name: string; description: string; category: Category; glyph: Glyph;
  price: number; installMinutes: number; w: number; h: number; resizable: boolean;
  defaultColor: string; defaultMaterial: string;
}

export const CATALOG: CatalogItem[] = [
  { id: "storage-box", name: "Modular Storage Box", description: "Lidded cube with soft-close hinge and anti-slide base.", category: "Storage", glyph: "box", price: 89, installMinutes: 15, w: 40, h: 32, resizable: true, defaultColor: "onyx", defaultMaterial: "abs" },
  { id: "underseat", name: "Under-Seat Drawer", description: "Slide-out drawer that fits beneath front seats.", category: "Storage", glyph: "underseat", price: 149, installMinutes: 45, w: 44, h: 26, resizable: true, defaultColor: "graphite", defaultMaterial: "abs" },
  { id: "shelf", name: "Rear Organizer Shelf", description: "Two-tier shelf for the cargo area.", category: "Storage", glyph: "shelf", price: 179, installMinutes: 60, w: 110, h: 34, resizable: true, defaultColor: "onyx", defaultMaterial: "fabric" },
  { id: "console-org", name: "Console Organizer", description: "Divided insert for the center console bin.", category: "Storage", glyph: "console", price: 39, installMinutes: 5, w: 18, h: 30, resizable: false, defaultColor: "onyx", defaultMaterial: "abs" },
  { id: "door-org", name: "Door Pocket Organizer", description: "Slim pocket that mounts to the inner door panel.", category: "Storage", glyph: "door", price: 45, installMinutes: 10, w: 10, h: 48, resizable: true, defaultColor: "graphite", defaultMaterial: "fabric" },
  { id: "armrest", name: "Padded Armrest", description: "Raised armrest with hidden storage.", category: "Comfort", glyph: "armrest", price: 119, installMinutes: 30, w: 20, h: 42, resizable: false, defaultColor: "cognac", defaultMaterial: "leather" },
  { id: "seatback", name: "Seat-Back Organizer", description: "Tablet sleeve and pockets for rear passengers.", category: "Comfort", glyph: "seatback", price: 59, installMinutes: 10, w: 44, h: 10, resizable: false, defaultColor: "onyx", defaultMaterial: "fabric" },
  { id: "footrest", name: "Rear Footrest", description: "Angled, adjustable platform for long drives.", category: "Comfort", glyph: "footrest", price: 69, installMinutes: 15, w: 40, h: 22, resizable: true, defaultColor: "graphite", defaultMaterial: "abs" },
  { id: "cushion", name: "Lumbar Cushion", description: "Memory-foam support with breathable cover.", category: "Comfort", glyph: "cushion", price: 49, installMinutes: 0, w: 34, h: 16, resizable: false, defaultColor: "sand", defaultMaterial: "alcantara" },
  { id: "screen", name: "Rear Display Screen", description: "11\" headrest-mounted media display.", category: "Technology", glyph: "screen", price: 329, installMinutes: 90, w: 30, h: 8, resizable: false, defaultColor: "onyx", defaultMaterial: "abs" },
  { id: "charger", name: "Charging Station", description: "Four USB-C ports with 100W wireless pad.", category: "Technology", glyph: "charger", price: 139, installMinutes: 40, w: 22, h: 16, resizable: false, defaultColor: "onyx", defaultMaterial: "abs" },
  { id: "speaker", name: "Compact Speaker Pod", description: "Low-profile speaker with tuned enclosure.", category: "Technology", glyph: "speaker", price: 199, installMinutes: 75, w: 20, h: 20, resizable: true, defaultColor: "graphite", defaultMaterial: "abs" },
  { id: "holder", name: "Device Holder", description: "Magnetic mount for phones and tablets.", category: "Technology", glyph: "holder", price: 35, installMinutes: 5, w: 12, h: 10, resizable: false, defaultColor: "onyx", defaultMaterial: "abs" },
  { id: "cup", name: "Dual Cup Holder", description: "Expandable holder for bottles and cups.", category: "Convenience", glyph: "cup", price: 29, installMinutes: 5, w: 22, h: 12, resizable: false, defaultColor: "onyx", defaultMaterial: "abs" },
  { id: "umbrella", name: "Umbrella Sleeve", description: "Waterproof sleeve with drain channel.", category: "Convenience", glyph: "umbrella", price: 39, installMinutes: 10, w: 8, h: 60, resizable: false, defaultColor: "graphite", defaultMaterial: "fabric" },
  { id: "tray", name: "Accessory Tray", description: "Shallow tray for keys, cards and sunglasses.", category: "Convenience", glyph: "tray", price: 25, installMinutes: 0, w: 24, h: 16, resizable: true, defaultColor: "sand", defaultMaterial: "alcantara" },
  { id: "hook", name: "Jacket & Bag Hook", description: "Headrest hook rated to 10 kg.", category: "Convenience", glyph: "hook", price: 19, installMinutes: 0, w: 12, h: 8, resizable: false, defaultColor: "onyx", defaultMaterial: "abs" },
];

export const CATEGORIES: Category[] = ["Storage", "Comfort", "Technology", "Convenience"];
export const getItem = (id: string) => CATALOG.find((c) => c.id === id)!;
export const getColor = (id: string) => COLORS.find((c) => c.id === id) ?? COLORS[0];
export const getMaterial = (id: string) => MATERIALS.find((m) => m.id === id) ?? MATERIALS[0];

export interface Rect { x: number; y: number; w: number; h: number }
export interface VehicleSpec { id: VehicleType; name: string; tagline: string; description: string; w: number; l: number; bounds: Rect }
export const VEHICLES: Record<VehicleType, VehicleSpec> = {
  sedan: { id: "sedan", name: "Sedan", tagline: "Five seats · 2 rows", description: "Compact cabin and a deep trunk. Ideal for commuters and students.", w: 180, l: 440, bounds: { x: 16, y: 92, w: 148, h: 320 } },
  suv: { id: "suv", name: "SUV", tagline: "Seven seats · 3 rows", description: "Tall cabin with flexible cargo space for families and road trips.", w: 196, l: 480, bounds: { x: 16, y: 92, w: 164, h: 364 } },
  truck: { id: "truck", name: "Pickup Truck", tagline: "Crew cab · open bed", description: "Crew cab plus a full bed for gear, tools and weekend projects.", w: 200, l: 560, bounds: { x: 16, y: 92, w: 168, h: 444 } },
};
