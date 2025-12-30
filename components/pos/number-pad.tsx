"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NumberPadProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit?: () => void;
  maxLength?: number;
  className?: string;
};

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export function NumberPad({
  value,
  onChange,
  onSubmit,
  maxLength = 6,
  className,
}: NumberPadProps) {
  const append = (digit: string) => {
    if (value.length >= maxLength) return;
    onChange(`${value}${digit}`);
  };

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {keys.map((key) => (
        <Button
          key={key}
          type="button"
          size="lg"
          className="h-14 text-xl"
          onClick={() => append(key)}
        >
          {key}
        </Button>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="h-14 text-sm uppercase"
        onClick={() => onChange("")}
      >
        Limpiar
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="h-14 text-sm uppercase"
        onClick={() => onChange(value.slice(0, -1))}
      >
        Borrar
      </Button>
      <Button
        type="button"
        size="lg"
        className="h-14 text-sm uppercase"
        onClick={onSubmit}
        disabled={!onSubmit}
      >
        Listo
      </Button>
    </div>
  );
}
