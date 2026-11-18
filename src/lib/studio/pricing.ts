import { getItem, getMaterial } from "./catalog";
import type { PlacedItem } from "./types";

export const DESIGN_FEE = 49;
export const INSTALL_RATE_PER_HOUR = 85;

/** Larger-than-default sizes cost proportionally more (by area), never less than base. */
export function sizeMultiplier(p: PlacedItem) {
  const base = getItem(p.itemId);
  return Math.max(1, (p.w * p.h) / (base.w * base.h));
}
export function itemPrice(p: PlacedItem) {
  return Math.round(getItem(p.itemId).price * sizeMultiplier(p)) * p.quantity;
}
export function computePricing(items: PlacedItem[]) {
  const subtotal = items.reduce((s, p) => s + itemPrice(p), 0);
  const materials = items.reduce((s, p) => s + getMaterial(p.material).surcharge * p.quantity, 0);
  const customization = items.length ? materials + DESIGN_FEE : 0;
  const minutes = items.reduce((s, p) => s + getItem(p.itemId).installMinutes * p.quantity, 0);
  const installation = Math.round((minutes / 60) * INSTALL_RATE_PER_HOUR);
  return { subtotal, customization, installation, minutes, total: subtotal + customization + installation };
}
export const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
