"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Vendor = {
  id: string;
  name: string;
  code: string;
  isFavorite: boolean;
};

type VendorSelectProps = {
  vendors: Vendor[];
  onSelect: (vendor: Vendor) => void;
};

export function VendorSelect({ vendors, onSelect }: VendorSelectProps) {
  const [query, setQuery] = useState("");

  const favorites = useMemo(
    () => vendors.filter((vendor) => vendor.isFavorite).slice(0, 8),
    [vendors]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(q) ||
        vendor.code.toLowerCase().includes(q)
    );
  }, [vendors, query]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl">Selecciona vendedor</h2>
        <Input
          className="h-12 text-base"
          placeholder="Buscar por nombre o codigo..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Favoritos
          </h3>
          <Button variant="ghost" size="sm" type="button">
            Escanear QR (pronto)
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {favorites.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground">
              Marca favoritos en Admin para verlos aqui.
            </Card>
          ) : (
            favorites.map((vendor) => (
              <Button
                key={vendor.id}
                type="button"
                className="h-14 justify-start text-left text-base"
                variant="secondary"
                onClick={() => onSelect(vendor)}
              >
                <span className="mr-3 rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
                  {vendor.code}
                </span>
                {vendor.name}
              </Button>
            ))
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Todos
        </h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((vendor) => (
            <Button
              key={vendor.id}
              type="button"
              className="h-14 justify-start text-left text-base"
              variant="outline"
              onClick={() => onSelect(vendor)}
            >
              <span className="mr-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
                {vendor.code}
              </span>
              {vendor.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
