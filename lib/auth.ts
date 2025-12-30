import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "pos_session";

type SessionPayload = {
  userId: string;
  role: UserRole;
  name: string;
};

const secret = process.env.SESSION_SECRET ?? "dev-secret";

const base64Url = (value: string) =>
  Buffer.from(value).toString("base64url");

const signValue = (value: string) =>
  createHmac("sha256", secret).update(value).digest("base64url");

const encode = (payload: SessionPayload) => {
  const json = JSON.stringify(payload);
  const body = base64Url(json);
  const sig = signValue(body);
  return `${body}.${sig}`;
};

const decode = (value?: string): SessionPayload | null => {
  if (!value) return null;
  const [body, sig] = value.split(".");
  if (!body || !sig) return null;
  const expected = signValue(body);
  const valid =
    expected.length === sig.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  if (!valid) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
};

export const getSession = async () => {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  const decoded = decode(value);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true, name: true },
  });
  if (!user) {
    return null;
  }

  return { userId: user.id, role: user.role, name: user.name };
};

export const requireSession = async () => {
  const session = await getSession();
  if (!session) throw new Error("NO_SESSION");
  return session;
};

export const requireAdmin = async () => {
  const session = await requireSession();
  if (session.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session;
};

export const requireSessionOrRedirect = async (nextPath: string) => {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return session;
};

export const requireAdminOrRedirect = async (nextPath: string) => {
  const session = await requireSessionOrRedirect(nextPath);
  if (session.role !== "ADMIN") redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return session;
};

export const setSession = async (payload: SessionPayload) => {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encode(payload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
};

export const clearSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
};
