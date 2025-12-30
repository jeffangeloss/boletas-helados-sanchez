"use client";

import { useMemo, useState } from "react";

type VendorBadgeProps = {
  name: string;
  code?: string;
  size?: "sm" | "lg" | "xl";
};

const getInitials = (name: string) => {
  const parts = name
    .trim()
    .split(/\s+/g)
    .filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
};

export function VendorBadge({ name, code, size = "lg" }: VendorBadgeProps) {
  const [imageState, setImageState] = useState<{ code?: string; index: number }>({
    code,
    index: 0,
  });
  const initials = useMemo(() => getInitials(name), [name]);
  const sources = useMemo(() => {
    if (!code) return [];
    const safe = encodeURIComponent(code);
    return [`/vendors/${safe}.jpg`, `/vendors/${safe}.png`];
  }, [code]);
  const index = imageState.code === code ? imageState.index : 0;
  const src = sources[index] ?? null;

  const avatarSize =
    size === "xl" ? "h-24 w-24" : size === "lg" ? "h-16 w-16" : "h-12 w-12";
  const initialsSize =
    size === "xl" ? "text-3xl" : size === "lg" ? "text-lg" : "text-base";
  const nameSize =
    size === "xl" ? "text-4xl" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          "relative shrink-0 overflow-hidden rounded-2xl bg-slate-900 text-white",
          avatarSize,
        ].join(" ")}
        aria-label="Foto del vendedor"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Foto de ${name}`}
            className="h-full w-full object-cover"
            onError={() =>
              setImageState((prev) => {
                const current = prev.code === code ? prev.index : 0;
                return { code, index: current + 1 };
              })
            }
          />
        ) : (
          <div
            className={[
              "flex h-full w-full items-center justify-center font-bold",
              initialsSize,
            ].join(" ")}
          >
            {initials}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Vendedor
        </p>
        <p className={["truncate font-display font-semibold", nameSize].join(" ")}>
          {name}
        </p>
        {code ? (
          <p className="text-xs text-muted-foreground">Código: {code}</p>
        ) : null}
      </div>
    </div>
  );
}
