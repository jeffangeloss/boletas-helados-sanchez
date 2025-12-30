import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSessionOrRedirect } from "@/lib/auth";
import { PedidoFlow } from "@/components/pos/pedido-flow";
import { Button } from "@/components/ui/button";

export default async function PedidoPage() {
  await requireSessionOrRedirect("/pedido");

  const vendorsRaw = await prisma.vendor.findMany({
    where: { active: true },
    orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
  });
  const vendors = vendorsRaw.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    code: vendor.code,
    isFavorite: vendor.isFavorite,
  }));

  return (
    <main className="h-screen overflow-hidden px-4 py-3">
      <div className="mx-auto flex h-full max-w-[1500px] flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Flujo de mañana
            </p>
            <h1 className="font-display text-3xl">Pedido</h1>
          </div>
          <Button asChild variant="ghost">
            <Link href="/">Volver</Link>
          </Button>
        </div>
        <div className="min-h-0 flex-1">
          <PedidoFlow vendors={vendors} />
        </div>
      </div>
    </main>
  );
}
