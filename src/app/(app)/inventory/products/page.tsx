import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createInventoryProductAction } from "./actions";

type ProductRow = {
  id: number;
  name: string;
  sku: string | null;
  unit: string | null;
  unit_price: number;
  stock_qty: number;
  min_stock_qty: number;
  expires_on: string | null;
};

export default async function InventoryProductsPage() {
  let rows: ProductRow[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const res = await supabase
      .from("inventory_products")
      .select("id, name, sku, unit, unit_price, stock_qty, min_stock_qty, expires_on")
      .order("created_at", { ascending: false })
      .limit(200);
    rows = res.data ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Stock · Produits</h2>
        <p className="text-sm text-slate-600">Gestion inventaire, seuils et dates d’expiration.</p>
      </div>

      <form action={createInventoryProductAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
        <input name="name" required placeholder="Produit" className="rounded-md border px-3 py-2" />
        <input name="sku" placeholder="SKU" className="rounded-md border px-3 py-2" />
        <input name="unit" placeholder="Unité (boîte, ml...)" className="rounded-md border px-3 py-2" />
        <input name="unit_price" type="number" step="0.01" placeholder="Prix unitaire" className="rounded-md border px-3 py-2" />
        <input name="stock_qty" type="number" step="0.01" placeholder="Stock" className="rounded-md border px-3 py-2" />
        <input name="min_stock_qty" type="number" step="0.01" placeholder="Seuil min" className="rounded-md border px-3 py-2" />
        <input name="expires_on" type="date" className="rounded-md border px-3 py-2" />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white">Ajouter produit</button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Produit</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Prix</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Seuil</th>
              <th className="px-3 py-2">État</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-3 text-slate-500">
                  Aucun produit.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const low = Number(r.stock_qty) <= Number(r.min_stock_qty);
                return (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2">{r.sku || "—"}</td>
                    <td className="px-3 py-2">{r.unit_price}</td>
                    <td className="px-3 py-2">{r.stock_qty}</td>
                    <td className="px-3 py-2">{r.min_stock_qty}</td>
                    <td className="px-3 py-2">{low ? "⚠ Stock faible" : "OK"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
