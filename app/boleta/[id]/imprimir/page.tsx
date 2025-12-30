import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSessionOrRedirect } from "@/lib/auth";
import { formatCurrency } from "@/lib/date";
import PrintControls from "./print-controls";
import { VendorBadge } from "@/components/pos/vendor-badge";
import { PrintMetaProvider, PrintTime } from "./print-meta";

type PrintPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ImprimirBoletaPage({ params }: PrintPageProps) {
  const { id } = await params;
  await requireSessionOrRedirect(`/boleta/${id}/imprimir`);

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      vendor: true,
      lines: { include: { product: true } },
    },
  });

  if (!ticket) {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 pos-shadow">
          <p className="text-lg font-semibold">Boleta no encontrada.</p>
          <Link className="mt-4 inline-block text-primary underline" href="/">
            Volver
          </Link>
        </div>
      </main>
    );
  }

  const lines = ticket.lines.sort(
    (a, b) =>
      a.product.displayOrder - b.product.displayOrder ||
      a.product.name.localeCompare(b.product.name)
  );

  const batteryTotal = Number(ticket.batteryUnitPrice) * ticket.batteryQty;

  return (
    <main className="min-h-screen px-4 py-6 print:bg-white">
      <PrintMetaProvider
        ticketId={ticket.id}
        initialPrintedAt={ticket.printedAt?.toISOString() ?? null}
      >
      <style>{`
        @media print {
          body {
            background: #fff !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 10mm;
          }
        }
      `}</style>

      <div className="mx-auto max-w-md space-y-4">
        <PrintControls />

        <div className="rounded-2xl bg-white p-5 pos-shadow print:shadow-none">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Helados Donofrio · Mayorista
            </p>
            <p className="text-xl font-bold">Boleta</p>
            <div className="flex items-start justify-between gap-4">
              <VendorBadge
                name={ticket.vendor.name}
                code={ticket.vendor.code}
                size="sm"
              />
              <div className="text-right text-sm">
                <p>
                  <span className="text-muted-foreground">Fecha:</span>{" "}
                  <span className="font-semibold">{ticket.date}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Hora:</span>{" "}
                  <span className="font-semibold">
                    <PrintTime />
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">ID: {ticket.id}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t pt-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground">
              <div className="col-span-1 text-right">PDD</div>
              <div className="col-span-6">Producto</div>
              <div className="col-span-1 pr-2 text-right">Ayer</div>
              <div className="col-span-1 border-l border-slate-200 pl-2 text-right">
                Hoy
              </div>
              <div className="col-span-3 text-right">Importe</div>
            </div>

            <div className="mt-2 space-y-2">
              {lines.length ? (
                lines.map((line) => {
                  const subtotal = Number(line.subtotal);
                  const isEmpty =
                    line.orderQty === 0 &&
                    line.leftoversPrev === 0 &&
                    line.leftoversNow === 0 &&
                    subtotal === 0;

                  return (
                    <div
                      key={line.id}
                      className={[
                        "grid grid-cols-12 gap-2 text-sm",
                        isEmpty ? "text-muted-foreground" : "",
                      ].join(" ")}
                    >
                      <div className="col-span-1 text-right font-semibold tabular-nums">
                        {line.orderQty}
                      </div>
                    <div className="col-span-6 leading-tight">
                      {line.product.name}
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(Number(line.unitPriceUsed))}
                      </div>
                    </div>
                    <div className="col-span-1 pr-2 text-right font-semibold tabular-nums">
                      {line.leftoversPrev}
                    </div>
                    <div className="col-span-1 border-l border-slate-200 pl-2 text-right font-semibold tabular-nums">
                      {line.leftoversNow}
                    </div>
                      <div className="col-span-3 text-right font-semibold tabular-nums">
                        {formatCurrency(subtotal)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">Sin productos.</p>
              )}
            </div>

            <div className="mt-4 space-y-2 border-t pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Batería</span>
                <span className="font-semibold">
                  {ticket.batteryQty} × {formatCurrency(Number(ticket.batteryUnitPrice))} ={" "}
                  {formatCurrency(batteryTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-lg font-bold">
                  {formatCurrency(Number(ticket.total))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pagado</span>
                <span className="font-semibold">
                  {formatCurrency(Number(ticket.paidAmount))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Saldo</span>
                <span className="font-semibold">
                  {formatCurrency(Number(ticket.balance))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estado</span>
                <span className="font-semibold">{ticket.paymentStatus}</span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Guardado localmente en esta computadora. Recomendación: imprimir al
            cerrar la boleta.
          </p>
        </div>
      </div>
      </PrintMetaProvider>
    </main>
  );
}
