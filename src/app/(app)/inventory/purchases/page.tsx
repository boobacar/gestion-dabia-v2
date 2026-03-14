import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createInventoryPurchaseAction } from "./actions";

type ProductOption = { id: number; name: string };
type PurchaseRow = {
  id: number;
  quantity: number;
  unit_cost: number;
  supplier: string | null;
  purchased_on: string;
  inventory_products: { name: string } | null;
};

export default async function InventoryPurchasesPage() {
  let products: ProductOption[] = [];
  let purchases: PurchaseRow[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const [productsRes, purchasesRes] = await Promise.all([
      supabase.from("inventory_products").select("id, name").order("name", { ascending: true }).limit(500),
      supabase
        .from("inventory_purchases")
        .select("id, quantity, unit_cost, supplier, purchased_on, inventory_products(name)")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    products = productsRes.data ?? [];
    purchases = (purchasesRes.data as PurchaseRow[] | null) ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Stock · Achats</h2>
        <p className="text-sm text-slate-600">Entrées stock fournisseurs + coûts.</p>
      </div>

      <form action={createInventoryPurchaseAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
        <select name="product_id" required className="rounded-md border px-3 py-2">
          <option value="">Produit</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input name="quantity" type="number" step="0.01" required placeholder="Quantité" className="rounded-md border px-3 py-2" />
        <input name="unit_cost" type="number" step="0.01" placeholder="Coût unitaire" className="rounded-md border px-3 py-2" />
        <input name="supplier" placeholder="Fournisseur" className="rounded-md border px-3 py-2" />
        <input name="purchased_on" type="date" className="rounded-md border px-3 py-2" />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white md:col-span-5">Ajouter achat</button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Produit</th>
              <th className="px-3 py-2">Quantité</th>
              <th className="px-3 py-2">Coût unitaire</th>
              <th className="px-3 py-2">Fournisseur</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-3 text-slate-500">
                  Aucun achat.
                </td>
              </tr>
            ) : (
              purchases.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{new Date(p.purchased_on).toLocaleDateString("fr-FR")}</td>
                  <td className="px-3 py-2">{p.inventory_products?.name || "—"}</td>
                  <td className="px-3 py-2">{p.quantity}</td>
                  <td className="px-3 py-2">{p.unit_cost}</td>
                  <td className="px-3 py-2">{p.supplier || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
