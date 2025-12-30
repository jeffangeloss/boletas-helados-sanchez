import { z } from "zod";

export const pinSchema = z
  .string()
  .regex(/^\d{4,6}$/, "PIN de 4 a 6 dígitos");

export const nonNegativeInt = z
  .number()
  .int()
  .min(0, "No puede ser negativo");

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD");
