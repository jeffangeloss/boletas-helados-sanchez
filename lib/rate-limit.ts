import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

const isMissingTableError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021";

const ensurePinAttemptTable = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PinAttempt" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "key" TEXT NOT NULL,
      "attempts" INTEGER NOT NULL DEFAULT 0,
      "lockUntil" DATETIME,
      "updatedAt" DATETIME NOT NULL
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "PinAttempt_key_key" ON "PinAttempt"("key");`
  );
};

const withPinAttemptTable = async <T>(operation: () => Promise<T>) => {
  try {
    return await operation();
  } catch (error) {
    if (!isMissingTableError(error)) throw error;
    await ensurePinAttemptTable();
    return operation();
  }
};

const getKey = async () => {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "global";
  return "global";
};

export const getPinLock = async () => {
  const key = await getKey();
  const record = await withPinAttemptTable(() =>
    prisma.pinAttempt.findUnique({ where: { key } })
  );
  if (!record?.lockUntil) return { locked: false, key };
  const now = new Date();
  if (record.lockUntil > now) {
    return { locked: true, lockUntil: record.lockUntil, key };
  }
  await withPinAttemptTable(() =>
    prisma.pinAttempt.update({
      where: { key },
      data: { lockUntil: null, attempts: 0 },
    })
  );
  return { locked: false, key };
};

export const registerPinFailure = async () => {
  const key = await getKey();
  const record = await withPinAttemptTable(() =>
    prisma.pinAttempt.upsert({
      where: { key },
      update: { attempts: { increment: 1 } },
      create: { key, attempts: 1 },
    })
  );

  if (record.attempts >= MAX_ATTEMPTS) {
    const lockUntil = new Date(Date.now() + LOCK_SECONDS * 1000);
    await withPinAttemptTable(() =>
      prisma.pinAttempt.update({
        where: { key },
        data: { lockUntil, attempts: 0 },
      })
    );
    return { locked: true, lockUntil };
  }
  return { locked: false };
};

export const clearPinAttempts = async () => {
  const key = await getKey();
  await withPinAttemptTable(() =>
    prisma.pinAttempt.upsert({
      where: { key },
      update: { attempts: 0, lockUntil: null },
      create: { key, attempts: 0 },
    })
  );
};
