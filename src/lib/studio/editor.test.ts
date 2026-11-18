import { describe, expect, it } from "vitest";
import { clampItem } from "./editor";
import { VEHICLES } from "./catalog";

describe("placement bounds", () => {
  it("items dropped outside the car are pulled inside the interior", () => {
    const b = VEHICLES.sedan.bounds;
    const p = clampItem({ uid: "a", itemId: "tray", x: -500, y: 9999, w: 24, h: 16, rotation: 0, color: "onyx", material: "abs", quantity: 1 }, "sedan");
    expect(p.x).toBe(b.x + 12);
    expect(p.y).toBe(b.y + b.h - 8);
  });
});
