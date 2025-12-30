"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSession } from "@/lib/auth";
import { z } from "zod";

const vendorSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  active: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
});

export const listVendors = async () => {
  await requireSession();
  const vendors = await prisma.vendor.findMany({
    where: { active: true },
    orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
  });
  return vendors.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    code: vendor.code,
    active: vendor.active,
    isFavorite: vendor.isFavorite,
  }));
};

export const searchVendors = async (query: string) => {
  await requireSession();
  const vendors = await prisma.vendor.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: query } },
        { code: { contains: query } },
      ],
    },
    orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
  });
  return vendors.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    code: vendor.code,
    active: vendor.active,
    isFavorite: vendor.isFavorite,
  }));
};

export const createVendor = async (data: z.infer<typeof vendorSchema>) => {
  await requireAdmin();
  const parsed = vendorSchema.safeParse(data);
  if (!parsed.success) throw new Error("INVALID");
  const vendor = await prisma.vendor.create({ data: parsed.data });
  return {
    id: vendor.id,
    name: vendor.name,
    code: vendor.code,
    active: vendor.active,
    isFavorite: vendor.isFavorite,
  };
};

export const updateVendor = async (
  id: string,
  data: Partial<z.infer<typeof vendorSchema>>
) => {
  await requireAdmin();
  const vendor = await prisma.vendor.update({ where: { id }, data });
  return {
    id: vendor.id,
    name: vendor.name,
    code: vendor.code,
    active: vendor.active,
    isFavorite: vendor.isFavorite,
  };
};

export const toggleVendorFavorite = async (id: string, isFavorite: boolean) => {
  await requireAdmin();
  const vendor = await prisma.vendor.update({ where: { id }, data: { isFavorite } });
  return {
    id: vendor.id,
    name: vendor.name,
    code: vendor.code,
    active: vendor.active,
    isFavorite: vendor.isFavorite,
  };
};
