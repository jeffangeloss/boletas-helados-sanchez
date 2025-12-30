import Link from "next/link";
import { getSession } from "@/lib/auth";
import { todayIso } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const session = await getSession();

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-white/80 p-6 pos-shadow md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Donofrio - Mayorista
            </p>
            <h1 className="font-display text-4xl md:text-5xl">
              Panel de Pedidos y Cobros
            </h1>
            <p className="text-sm text-muted-foreground">
              Fecha operativa: {todayIso()}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">Usuario activo</span>
            <span className="text-lg font-semibold">
              {session?.name ?? "Sin sesión"}
            </span>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
              {session?.role ?? "Invitado"}
            </span>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="pos-shadow">
            <CardHeader>
              <CardTitle className="font-display text-3xl">
                📦 Pedido (Mañana)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Registra lo que el vendedor pide para hoy.
              </p>
            </CardHeader>
            <CardContent>
              <Button asChild className="h-16 w-full text-lg">
                <Link href="/pedido">Empezar pedido</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="pos-shadow">
            <CardHeader>
              <CardTitle className="font-display text-3xl">
                🧾 Cierre y Cobro (Tarde)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Calcula venta, batería y cierre de boleta.
              </p>
            </CardHeader>
            <CardContent>
              <Button asChild className="h-16 w-full text-lg">
                <Link href="/cierre">Ir al cierre</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <div className="flex items-center justify-end">
          <Button asChild variant="ghost" className="text-sm">
            <Link href="/admin">⚙️ Admin</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
