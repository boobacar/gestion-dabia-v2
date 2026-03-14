import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createPaymentAction } from "./actions";

type PaymentRow = {
  id: number;
  amount: number;
  method: string | null;
  paid_at: string;
  invoice_id: number | null;
};

type InvoiceOption = { id: number; code: string | null; amount: number; paid_amount: number };

export default async function PatientPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let rows: PaymentRow[] = [];
  let invoices: InvoiceOption[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const [paymentsRes, invoicesRes] = await Promise.all([
      supabase
        .from("payments")
        .select("id, amount, method, paid_at, invoice_id")
        .eq("patient_id", Number(id))
        .order("paid_at", { ascending: false })
        .limit(100),
      supabase
        .from("invoices")
        .select("id, code, amount, paid_amount")
        .eq("patient_id", Number(id))
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    rows = paymentsRes.data ?? [];
    invoices = invoicesRes.data ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Patient · Paiements</h2>
        <p className="text-sm text-slate-600">Encaissements et rattachement facture.</p>
      </div>

      <form action={createPaymentAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
        <input type="hidden" name="patient_id" value={id} />
        <select name="invoice_id" className="rounded-md border px-3 py-2">
          <option value="">Sans facture</option>
          {invoices.map((i) => (
            <option key={i.id} value={i.id}>
              {i.code || `Facture #${i.id}`} — reste {Math.max(0, Number(i.amount) - Number(i.paid_amount))}
            </option>
          ))}
        </select>
        <input name="amount" type="number" step="0.01" required placeholder="Montant" className="rounded-md border px-3 py-2" />
        <input name="method" placeholder="Méthode (cash, wave...)" className="rounded-md border px-3 py-2" />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white md:col-span-2">Ajouter paiement</button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Montant</th>
              <th className="px-3 py-2">Méthode</th>
              <th className="px-3 py-2">Facture</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={4}>
                  Aucun paiement.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{new Date(r.paid_at).toLocaleString("fr-FR")}</td>
                  <td className="px-3 py-2">{r.amount}</td>
                  <td className="px-3 py-2">{r.method || "—"}</td>
                  <td className="px-3 py-2">{r.invoice_id ? `#${r.invoice_id}` : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
