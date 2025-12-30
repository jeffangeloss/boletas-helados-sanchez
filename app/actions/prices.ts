"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const priceSchema = z.object({
  productId: z.string().min(1),
  price: z.number().positive(),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const setProductPrice = async (data: z.infer<typeof priceSchema>) => {
  await requireAdmin();
  const parsed = priceSchema.safeParse(data);
  if (!parsed.success) throw new Error("INVALID");
  await prisma.priceHistory.upsert({
    where: {
      productId_validFrom: {
        productId: parsed.data.productId,
        validFrom: parsed.data.validFrom,
      },
    },
    update: { price: parsed.data.price },
    create: parsed.data,
  });
  return { ok: true };
};
