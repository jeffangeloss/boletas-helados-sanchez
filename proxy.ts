import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "pos_session";
const secret = process.env.SESSION_SECRET ?? "dev-secret";

const base64UrlToBytes = (value: string) => {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const bytesToUtf8 = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

const constantTimeEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a[i] ^ b[i];
  return result === 0;
};

const verifySession = async (value?: string) => {
  if (!value) return null;
  const [body, sig] = value.split(".");
  if (!body || !sig) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
  );
  const provided = base64UrlToBytes(sig);
  if (!constantTimeEqual(expected, provided)) return null;

  try {
    const payload = bytesToUtf8(base64UrlToBytes(body));
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

export async function proxy(request: NextRequest) {
  const session = await verifySession(request.cookies.get(COOKIE_NAME)?.value);
  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname.startsWith("/admin") && session.role !== "ADMIN") {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/pedido/:path*", "/cierre/:path*", "/boleta/:path*"],
};
