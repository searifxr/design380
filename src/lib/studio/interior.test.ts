import { describe, expect, it } from "vitest";
import { CABIN_SPECS, componentsForVehicle, createDefaultInterior, resetComponentStyle, updateComponentStyle } from "./interior";

describe("interior customization", () => {
  it("changes one seat without changing any other component", () => {
    const initial = createDefaultInterior();
    const next = updateComponentStyle(initial, "driverSeat", { color: "#123456" });
    expect(next.components.driverSeat.color).toBe("#123456");
    expect(next.components.passengerSeat).toEqual(initial.components.passengerSeat);
    expect(next.components.doorLeft).toEqual(initial.components.doorLeft);
  });

  it("resets only the selected component", () => {
    const changed = updateComponentStyle(createDefaultInterior(), "doorLeft", { color: "#ff0000" });
    const reset = resetComponentStyle(changed, "doorLeft");
    expect(reset.components.doorLeft).toEqual(createDefaultInterior().components.doorLeft);
    expect(reset.components.driverSeat).toEqual(changed.components.driverSeat);
  });

  it("offers third-row customization only for the SUV", () => {
    expect(componentsForVehicle("suv").some((c) => c.id === "thirdRowSeat")).toBe(true);
    expect(componentsForVehicle("sedan").some((c) => c.id === "thirdRowSeat")).toBe(false);
    expect(componentsForVehicle("truck").some((c) => c.id === "thirdRowSeat")).toBe(false);
  });

  it("uses genuinely different cabin dimensions for each vehicle", () => {
    expect(new Set(Object.values(CABIN_SPECS).map((s) => s.width)).size).toBe(3);
    expect(CABIN_SPECS.suv.thirdRowZ).not.toBeNull();
    expect(CABIN_SPECS.sedan.thirdRowZ).toBeNull();
  });
});
