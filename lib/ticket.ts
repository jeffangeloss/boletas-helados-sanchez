import type { BatteryMode } from "@prisma/client";

export const calcSoldQty = (
  orderQty: number,
  leftoversPrev: number,
  leftoversNow: number
) => orderQty + leftoversPrev - leftoversNow;

export const calcSubtotal = (soldQty: number, unitPrice: number) =>
  Number((soldQty * unitPrice).toFixed(2));

export const calcBatteryTotal = (
  mode: BatteryMode,
  unitPrice: number,
  qty: number
) => {
  if (mode === "PER_UNIT") return Number((unitPrice * qty).toFixed(2));
  return Number((unitPrice * qty).toFixed(2));
};

export const sumTotals = (subtotals: number[], batteryTotal: number) =>
  Number((subtotals.reduce((acc, value) => acc + value, 0) + batteryTotal).toFixed(2));
