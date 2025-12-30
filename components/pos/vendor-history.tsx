"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/date";

type HistoryItem = {
  id: string;
  date: string;
  total: number;
  paymentStatus: string;
};

export function VendorHistory({ history }: { history: HistoryItem[] }) {
  if (!history.length) {
    return (
      <Card className="p-4 text-sm text-muted-foreground">
        Sin historial reciente.
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-2">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Historial reciente
      </p>
      <div className="space-y-1 text-sm">
        {history.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <span>{item.date}</span>
            <span className="font-semibold">{formatCurrency(item.total)}</span>
            <span className="text-xs text-muted-foreground">
              {item.paymentStatus}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
