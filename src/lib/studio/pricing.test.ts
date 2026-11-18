import { describe, expect, it } from "vitest";
import { computePricing } from "./pricing";
import type { PlacedItem } from "./types";

const item = (o: Partial<PlacedItem>): PlacedItem => ({ uid: "a", itemId: "storage-box", x: 0, y: 0, w: 40, h: 32, rotation: 0, color: "onyx", material: "abs", quantity: 1, ...o });

describe("pricing", () => {
  it("empty design costs nothing", () => expect(computePricing([]).total).toBe(0));
  it("base item adds design fee and install labor", () => {
    const p = computePricing([item({})]);
    expect(p.subtotal).toBe(89);
    expect(p.customization).toBe(49);
    expect(p.installation).toBe(21); // 15 min at $85/h
  });
  it("material surcharge and quantity multiply", () => {
    const p = computePricing([item({ material: "leather", quantity: 2 })]);
    expect(p.subtotal).toBe(178);
    expect(p.customization).toBe(49 + 120);
  });
  it("doubling area doubles item price", () => {
    expect(computePricing([item({ w: 80 })]).subtotal).toBe(178);
  });
});
