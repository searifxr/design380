import type { VehicleType } from "./catalog";
export interface PlacedItem { uid: string; itemId: string; x: number; y: number; w: number; h: number; rotation: number; color: string; material: string; quantity: number }
export interface Design { id: string; name: string; vehicle: VehicleType; items: PlacedItem[]; updatedAt: number; total?: number }
