import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createDocumentAction } from "./actions";

type DocRow = {
  id: number;
  title: string;
  type: string;
  invoice_id: number | null;
  note: string | null;
  created_at: string;
};

type InvoiceOption = { id: number; code: string | null };

export default async function PatientDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let docs: DocRow[] = [];
  let invoices: InvoiceOption[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const [docsRes, invoicesRes] = await Promise.all([
      supabase
        .from("documents")
        .select("id, title, type, invoice_id, note, created_at")
        .eq("patient_id", Number(id))
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("invoices")
        .select("id, code")
        .eq("patient_id", Number(id))
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    docs = docsRes.data ?? [];
    invoices = invoicesRes.data ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Patient · Documents</h2>
        <p className="text-sm text-slate-600">Documents liés (devis/factures/certificats/custom).</p>
      </div>

      <form action={createDocumentAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
        <input type="hidden" name="patient_id" value={id} />
        <input name="title" required placeholder="Titre document" className="rounded-md border px-3 py-2" />
        <select name="type" className="rounded-md border px-3 py-2">
          <option value="custom">Custom</option>
          <option value="quote">Devis</option>
          <option value="invoice">Facture</option>
          <option value="prescription">Ordonnance</option>
          <option value="certificate">Certificat</option>
          <option value="honorary_note">Note d&apos;honoraires</option>
        </select>
        <select name="invoice_id" className="rounded-md border px-3 py-2">
          <option value="">Sans facture liée</option>
          {invoices.map((i) => (
            <option key={i.id} value={i.id}>
              {i.code || `Facture #${i.id}`}
            </option>
          ))}
        </select>
        <input name="note" placeholder="Note" className="rounded-md border px-3 py-2" />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white">Créer document</button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Titre</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Facture liée</th>
              <th className="px-3 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-3 text-slate-500">
                  Aucun document.
                </td>
              </tr>
            ) : (
              docs.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-3 py-2">{new Date(d.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-3 py-2">{d.title}</td>
                  <td className="px-3 py-2">{d.type}</td>
                  <td className="px-3 py-2">{d.invoice_id ? `#${d.invoice_id}` : "—"}</td>
                  <td className="px-3 py-2">{d.note || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
