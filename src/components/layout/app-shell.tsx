import { signOutAction } from "@/app/(app)/actions";
import Link from "next/link";
import { ReactNode } from "react";

const nav = [
  ["Tableau de bord", "/dashboard"],
  ["Rendez-Vous", "/appointments"],
  ["Réservation en ligne", "/online-appointments"],
  ["Patients", "/patients"],
  ["Charges", "/expenses"],
  ["Chéques", "/cheques"],
  ["Rappels", "/notes"],
  ["Tâches", "/tasks"],
  ["Stock Produits", "/inventory/products"],
  ["Stock Achats", "/inventory/purchases"],
  ["Exportations", "/exports"],
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[260px_1fr] gap-4 p-4">
        <aside className="rounded-xl border bg-white p-4">
          <h1 className="mb-4 text-lg font-semibold">Gestion Dabia v2</h1>
          <nav className="space-y-2">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100"
              >
                {label}
              </Link>
            ))}
          </nav>
          <form action={signOutAction} className="mt-6">
            <button className="w-full rounded-md border px-3 py-2 text-sm hover:bg-slate-100">
              Déconnexion
            </button>
          </form>
        </aside>
        <main className="rounded-xl border bg-white p-6">{children}</main>
      </div>
    </div>
  );
}
