"use client";

import Link from "next/link";

export default function PrintControls() {
  return (
    <div className="no-print flex items-center justify-between">
      <Link className="text-sm text-primary underline" href="/">
        Volver
      </Link>
      <button
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        onClick={() => window.print()}
        type="button"
      >
        Imprimir
      </button>
    </div>
  );
}

