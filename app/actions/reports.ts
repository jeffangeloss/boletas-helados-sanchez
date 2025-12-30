"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { toCsv } from "@/lib/export";

const calcBattery = (unitPrice: number, qty: number) => Number((unitPrice * qty).toFixed(2));

export const getDailyReport = async (date: string) => {
  await requireAdmin();
  const tickets = await prisma.ticket.findMany({
    where: { date, status: "CLOSED" },
    include: { vendor: true, lines: { include: { product: true } } },
  });

  const totals = {
    totalProducts: 0,
    totalBattery: 0,
    totalGeneral: 0,
    ticketsPaid: 0,
    ticketsCredit: 0,
    ticketsPartial: 0,
  };

  const productTotals = new Map<
    string,
    { name: string; units: number; amount: number }
  >();
  const vendorTotals = new Map<string, { name: string; amount: number }>();

  tickets.forEach((ticket) => {
    const battery = calcBattery(Number(ticket.batteryUnitPrice), ticket.batteryQty);
    totals.totalBattery += battery;
    totals.totalGeneral += Number(ticket.total);
    if (ticket.paymentStatus === "PAID") totals.ticketsPaid += 1;
    if (ticket.paymentStatus === "CREDIT") totals.ticketsCredit += 1;
    if (ticket.paymentStatus === "PARTIAL") totals.ticketsPartial += 1;

    ticket.lines.forEach((line) => {
      totals.totalProducts += Number(line.subtotal);
      const existing = productTotals.get(line.productId) ?? {
        name: line.product.name,
        units: 0,
        amount: 0,
      };
      existing.units += line.soldQty;
      existing.amount += Number(line.subtotal);
      productTotals.set(line.productId, existing);
    });

    const vendor = vendorTotals.get(ticket.vendorId) ?? {
      name: ticket.vendor.name,
      amount: 0,
    };
    vendor.amount += Number(ticket.total);
    vendorTotals.set(ticket.vendorId, vendor);
  });

  const topProducts = Array.from(productTotals.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const topVendors = Array.from(vendorTotals.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return { totals, topProducts, topVendors };
};

export const exportTicketsCsv = async (start: string, end: string) => {
  await requireAdmin();
  const tickets = await prisma.ticket.findMany({
    where: { date: { gte: start, lte: end }, status: "CLOSED" },
    include: { vendor: true, lines: { include: { product: true } } },
    orderBy: { date: "asc" },
  });

  const headers = [
    "Fecha",
    "Vendedor",
    "Producto",
    "Pedido",
    "Sobras Ayer",
    "Sobras Hoy",
    "Vendidas",
    "Precio",
    "Subtotal",
    "Bateria",
    "Total Boleta",
    "Estado",
  ];

  const rows = tickets.flatMap((ticket) => {
    const battery = calcBattery(Number(ticket.batteryUnitPrice), ticket.batteryQty);
    return ticket.lines.map((line) => [
      ticket.date,
      ticket.vendor.name,
      line.product.name,
      line.orderQty,
      line.leftoversPrev,
      line.leftoversNow,
      line.soldQty,
      Number(line.unitPriceUsed),
      Number(line.subtotal),
      battery,
      Number(ticket.total),
      ticket.paymentStatus,
    ]);
  });

  return toCsv(headers, rows);
};
