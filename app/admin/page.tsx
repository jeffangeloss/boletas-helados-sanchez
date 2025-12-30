import Link from "next/link";
import { requireAdminOrRedirect } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  await requireAdminOrRedirect("/admin");
  const [productsRaw, vendorsRaw, settings] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: { prices: { orderBy: { validFrom: "desc" }, take: 1 } },
    }),
    prisma.vendor.findMany({ orderBy: { name: "asc" } }),
    prisma.settings.findUnique({ where: { id: "global" } }),
  ]);

  const products = productsRaw.map((product) => ({
    id: product.id,
    name: product.name,
    active: product.active,
    currentPrice: product.prices[0]?.price ? Number(product.prices[0].price) : null,
  }));

  const vendors = vendorsRaw.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    code: vendor.code,
    active: vendor.active,
    isFavorite: vendor.isFavorite,
  }));

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Administracion
            </p>
            <h1 className="font-display text-3xl">Panel Admin</h1>
          </div>
          <Button asChild variant="ghost">
            <Link href="/">Volver</Link>
          </Button>
        </div>
        <AdminDashboard
          products={products}
          vendors={vendors}
          settings={{
            batteryMode: settings?.batteryMode ?? "PER_DAY",
            batteryUnitPrice: settings ? Number(settings.batteryUnitPrice) : 3,
            batteryQty: settings?.batteryQty ?? 1,
          }}
        />
      </div>
    </main>
  );
}
