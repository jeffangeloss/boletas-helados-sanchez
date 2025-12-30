"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { pinSchema } from "@/lib/validators";
import { clearSession, setSession } from "@/lib/auth";
import { clearPinAttempts, getPinLock, registerPinFailure } from "@/lib/rate-limit";

export const loginWithPin = async (pin: string) => {
  const parsed = pinSchema.safeParse(pin);
  if (!parsed.success) {
    return { ok: false, message: "PIN inválido." };
  }

  const lock = await getPinLock();
  if (lock.locked) {
    return {
      ok: false,
      message: "Demasiados intentos. Espera 30 segundos.",
    };
  }

  const users = await prisma.user.findMany();
  const match = await Promise.all(
    users.map(async (user) => ({
      user,
      matches: await bcrypt.compare(pin, user.pinHash),
    }))
  );
  const found = match.find((entry) => entry.matches)?.user;

  if (!found) {
    const failure = await registerPinFailure();
    if (failure.locked) {
      return {
        ok: false,
        message: "Demasiados intentos. Espera 30 segundos.",
      };
    }
    return { ok: false, message: "PIN incorrecto." };
  }

  await clearPinAttempts();
  await setSession({ userId: found.id, role: found.role, name: found.name });

  return { ok: true, user: { name: found.name, role: found.role } };
};

export const logout = async () => {
  await clearSession();
};
