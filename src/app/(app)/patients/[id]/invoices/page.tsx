import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createInvoiceAction, generateInvoicePdfDocumentAction } from "./actions";

type InvoiceRow = {
  id: number;
  code: string | null;
  amount: number;
  paid_amount: number;
  status: string;
  due_date: string | null;
  created_at: string;
};

export default async function PatientInvoicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let rows: InvoiceRow[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const res = await supabase
      .from("invoices")
      .select("id, code, amount, paid_amount, status, due_date, created_at")
      .eq("patient_id", Number(id))
      .order("created_at", { ascending: false })
      .limit(100);

    rows = res.data ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Patient · Factures</h2>
        <p className="text-sm text-slate-600">Création facture + suivi reste à payer.</p>
      </div>

      <form action={createInvoiceAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
        <input type="hidden" name="patient_id" value={id} />
        <input name="code" placeholder="Code facture" className="rounded-md border px-3 py-2" />
        <input name="amount" type="number" step="0.01" required placeholder="Montant" className="rounded-md border px-3 py-2" />
        <input name="due_date" type="date" className="rounded-md border px-3 py-2" />
        <input name="note" placeholder="Note" className="rounded-md border px-3 py-2" />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white md:col-span-5">Créer facture</button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Montant</th>
              <th className="px-3 py-2">Reçu</th>
              <th className="px-3 py-2">Reste</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">PDF</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-3 text-slate-500">
                  Aucune facture.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.code || `#${r.id}`}</td>
                  <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-3 py-2">{r.amount}</td>
                  <td className="px-3 py-2">{r.paid_amount}</td>
                  <td className="px-3 py-2">{Math.max(0, Number(r.amount) - Number(r.paid_amount))}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2 space-y-2">
                    <a
                      href={`/api/pdf/invoice/${r.id}`}
                      target="_blank"
                      className="inline-block rounded-md border px-2 py-1"
                    >
                      Aperçu
                    </a>
                    <form action={generateInvoicePdfDocumentAction}>
                      <input type="hidden" name="patient_id" value={id} />
                      <input type="hidden" name="invoice_id" value={r.id} />
                      <button className="rounded-md border px-2 py-1">Ajouter aux documents</button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
