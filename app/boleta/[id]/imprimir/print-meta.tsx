"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { markTicketPrinted } from "@/app/actions/tickets";

type PrintMetaContextValue = {
  printedAt: Date | null;
};

const PrintMetaContext = createContext<PrintMetaContextValue | null>(null);

export function PrintMetaProvider({
  ticketId,
  initialPrintedAt,
  children,
}: {
  ticketId: string;
  initialPrintedAt: string | null;
  children: React.ReactNode;
}) {
  const [printedAtIso, setPrintedAtIso] = useState<string | null>(initialPrintedAt);

  const printedAt = useMemo(() => {
    if (!printedAtIso) return null;
    const date = new Date(printedAtIso);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [printedAtIso]);

  useEffect(() => {
    let canceled = false;
    void (async () => {
      let nextPrintedAt = printedAtIso;
      try {
        const result = await markTicketPrinted(ticketId);
        nextPrintedAt = result?.printedAt ?? null;
      } catch {
        nextPrintedAt = new Date().toISOString();
      }

      if (!canceled && nextPrintedAt) {
        setPrintedAtIso(nextPrintedAt);
      }

      window.setTimeout(() => window.print(), 300);
    })();

    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  return <PrintMetaContext.Provider value={{ printedAt }}>{children}</PrintMetaContext.Provider>;
}

export function PrintTime() {
  const context = useContext(PrintMetaContext);
  const printedAt = context?.printedAt ?? null;
  const formatted = useMemo(() => {
    if (!printedAt) return "—";
    return new Intl.DateTimeFormat("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(printedAt);
  }, [printedAt]);

  return <span suppressHydrationWarning>{formatted}</span>;
}
