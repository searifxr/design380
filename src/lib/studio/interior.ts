import type { VehicleType } from "./catalog";

export const INTERIOR_MATERIALS = [
  { id: "leather", name: "Nappa leather", roughness: 0.58, metalness: 0 },
  { id: "fabric", name: "Woven fabric", roughness: 0.94, metalness: 0 },
  { id: "suede", name: "Suede", roughness: 1, metalness: 0 },
  { id: "matte", name: "Matte plastic", roughness: 0.82, metalness: 0 },
  { id: "gloss", name: "Gloss black", roughness: 0.16, metalness: 0.12 },
  { id: "carbon", name: "Carbon fiber", roughness: 0.32, metalness: 0.35 },
  { id: "aluminum", name: "Brushed aluminum", roughness: 0.38, metalness: 0.85 },
  { id: "wood", name: "Wood grain", roughness: 0.46, metalness: 0 },
] as const;
export type InteriorMaterialId = (typeof INTERIOR_MATERIALS)[number]["id"];

export const INTERIOR_COMPONENT_IDS = [
  "driverSeat", "passengerSeat", "rearLeftSeat", "rearRightSeat", "thirdRowSeat",
  "doorLeft", "doorRight", "armrestLeft", "armrestRight",
  "dashboardUpper", "dashboardLower", "dashboardTrim", "centerConsole", "steeringWheel",
  "frontFloor", "rearFloor", "roof", "pillars",
] as const;
export type InteriorComponentId = (typeof INTERIOR_COMPONENT_IDS)[number];
export type InteriorCategory = "Seats" | "Doors" | "Dashboard" | "Cabin";

export interface ComponentStyle {
  color: string;
  secondaryColor: string;
  stitchingColor: string;
  material: InteriorMaterialId;
  roughness: number;
}

export interface ScreenAccessory {
  enabled: boolean;
  on: boolean;
  size: 9 | 11 | 13;
  frameColor: string;
}

export interface InteriorCustomization {
  components: Record<InteriorComponentId, ComponentStyle>;
  lighting: {
    enabled: boolean;
    frontColor: string;
    rearColor: string;
    frontBrightness: number;
    rearBrightness: number;
    doorStrips: boolean;
    dashboardStrip: boolean;
    footwell: boolean;
    overhead: boolean;
  };
  accessories: {
    screenLeft: ScreenAccessory;
    screenRight: ScreenAccessory;
    chargingPad: boolean;
    floorMats: boolean;
    doorSillLighting: boolean;
    cupholderLighting: boolean;
    usbPorts: boolean;
  };
}

const style = (
  color: string,
  material: InteriorMaterialId,
  secondaryColor = color,
  stitchingColor = "#c9b48f",
  roughness?: number,
): ComponentStyle => ({
  color,
  secondaryColor,
  stitchingColor,
  material,
  roughness: roughness ?? INTERIOR_MATERIALS.find((m) => m.id === material)?.roughness ?? 0.6,
});

export function createDefaultInterior(): InteriorCustomization {
  return {
    components: {
      driverSeat: style("#4a3328", "leather", "#251d19", "#c9b48f"),
      passengerSeat: style("#4a3328", "leather", "#251d19", "#c9b48f"),
      rearLeftSeat: style("#4a3328", "leather", "#251d19", "#c9b48f"),
      rearRightSeat: style("#4a3328", "leather", "#251d19", "#c9b48f"),
      thirdRowSeat: style("#353537", "leather", "#202022", "#8d8d91"),
      doorLeft: style("#2b2b2e", "leather", "#171719", "#8d8d91"),
      doorRight: style("#2b2b2e", "leather", "#171719", "#8d8d91"),
      armrestLeft: style("#4a3328", "leather", "#2b211c", "#c9b48f"),
      armrestRight: style("#4a3328", "leather", "#2b211c", "#c9b48f"),
      dashboardUpper: style("#242427", "matte", "#18181a", "#77777c"),
      dashboardLower: style("#37312c", "leather", "#211d1a", "#c9b48f"),
      dashboardTrim: style("#67686b", "aluminum", "#343538", "#c9b48f"),
      centerConsole: style("#29292c", "leather", "#151517", "#8d8d91"),
      steeringWheel: style("#242426", "leather", "#111112", "#8d8d91"),
      frontFloor: style("#242426", "fabric", "#18181a", "#5b5b60"),
      rearFloor: style("#242426", "fabric", "#18181a", "#5b5b60"),
      roof: style("#a29d91", "fabric", "#77736b", "#d5d0c5"),
      pillars: style("#8c887f", "fabric", "#66635d", "#c4bfb4"),
    },
    lighting: {
      enabled: true,
      frontColor: "#e3b76a",
      rearColor: "#7da7d9",
      frontBrightness: 0.65,
      rearBrightness: 0.45,
      doorStrips: true,
      dashboardStrip: true,
      footwell: true,
      overhead: true,
    },
    accessories: {
      screenLeft: { enabled: false, on: true, size: 11, frameColor: "#1c1c1f" },
      screenRight: { enabled: false, on: true, size: 11, frameColor: "#1c1c1f" },
      chargingPad: false,
      floorMats: false,
      doorSillLighting: false,
      cupholderLighting: false,
      usbPorts: false,
    },
  };
}

export function updateComponentStyle(
  config: InteriorCustomization,
  id: InteriorComponentId,
  patch: Partial<ComponentStyle>,
): InteriorCustomization {
  return {
    ...config,
    components: {
      ...config.components,
      [id]: { ...config.components[id], ...patch },
    },
  };
}

export function resetComponentStyle(config: InteriorCustomization, id: InteriorComponentId): InteriorCustomization {
  return updateComponentStyle(config, id, createDefaultInterior().components[id]);
}

export const INTERIOR_COMPONENTS: Array<{
  id: InteriorComponentId;
  name: string;
  category: InteriorCategory;
  vehicles?: VehicleType[];
}> = [
  { id: "driverSeat", name: "Driver seat", category: "Seats" },
  { id: "passengerSeat", name: "Front passenger seat", category: "Seats" },
  { id: "rearLeftSeat", name: "Rear left seat", category: "Seats" },
  { id: "rearRightSeat", name: "Rear right seat", category: "Seats" },
  { id: "thirdRowSeat", name: "Third row seats", category: "Seats", vehicles: ["suv"] },
  { id: "doorLeft", name: "Driver door panel", category: "Doors" },
  { id: "doorRight", name: "Passenger door panel", category: "Doors" },
  { id: "armrestLeft", name: "Driver padded armrest", category: "Doors" },
  { id: "armrestRight", name: "Passenger padded armrest", category: "Doors" },
  { id: "dashboardUpper", name: "Dashboard upper", category: "Dashboard" },
  { id: "dashboardLower", name: "Dashboard lower", category: "Dashboard" },
  { id: "dashboardTrim", name: "Dashboard trim", category: "Dashboard" },
  { id: "centerConsole", name: "Center console", category: "Dashboard" },
  { id: "steeringWheel", name: "Steering wheel", category: "Dashboard" },
  { id: "frontFloor", name: "Front carpet", category: "Cabin" },
  { id: "rearFloor", name: "Rear carpet", category: "Cabin" },
  { id: "roof", name: "Roof & headliner", category: "Cabin" },
  { id: "pillars", name: "Interior pillars", category: "Cabin" },
];

export function componentsForVehicle(vehicle: VehicleType) {
  return INTERIOR_COMPONENTS.filter((c) => !c.vehicles || c.vehicles.includes(vehicle));
}

export interface CabinSpec {
  width: number;
  roofHeight: number;
  rearZ: number;
  thirdRowZ: number | null;
  dashZ: number;
  seatWidth: number;
  doorLength: number;
}

/** Geometry is deliberately vehicle-specific while customization stays shared. */
export const CABIN_SPECS: Record<VehicleType, CabinSpec> = {
  sedan: { width: 2.5, roofHeight: 1.9, rearZ: 1.3, thirdRowZ: null, dashZ: -1.35, seatWidth: 0.72, doorLength: 2.75 },
  suv: { width: 2.75, roofHeight: 2.12, rearZ: 1.35, thirdRowZ: 2.45, dashZ: -1.45, seatWidth: 0.78, doorLength: 3.65 },
  truck: { width: 2.7, roofHeight: 2.02, rearZ: 1.5, thirdRowZ: null, dashZ: -1.4, seatWidth: 0.8, doorLength: 2.95 },
};

export function materialPreset(id: InteriorMaterialId) {
  return INTERIOR_MATERIALS.find((m) => m.id === id) ?? INTERIOR_MATERIALS[0];
}
