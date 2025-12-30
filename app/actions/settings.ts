"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const settingsSchema = z.object({
  batteryMode: z.enum(["PER_DAY", "PER_UNIT"]),
  batteryUnitPrice: z.number().min(0),
  batteryQty: z.number().int().min(1),
});

export const getSettings = async () => {
  await requireSession();
  const settings = await prisma.settings.findUnique({ where: { id: "global" } });
  if (settings) return settings;
  return prisma.settings.create({
    data: {
      id: "global",
      batteryMode: "PER_DAY",
      batteryUnitPrice: new Prisma.Decimal("3.00"),
      batteryQty: 1,
    },
  });
};

export const updateSettings = async (data: z.infer<typeof settingsSchema>) => {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(data);
  if (!parsed.success) throw new Error("INVALID");
  const settings = await prisma.settings.upsert({
    where: { id: "global" },
    update: {
      batteryMode: parsed.data.batteryMode,
      batteryUnitPrice: parsed.data.batteryUnitPrice,
      batteryQty: parsed.data.batteryQty,
    },
    create: {
      id: "global",
      batteryMode: parsed.data.batteryMode,
      batteryUnitPrice: parsed.data.batteryUnitPrice,
      batteryQty: parsed.data.batteryQty,
    },
  });
  return {
    batteryMode: settings.batteryMode,
    batteryUnitPrice: Number(settings.batteryUnitPrice),
    batteryQty: settings.batteryQty,
  };
};
