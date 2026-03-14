import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createProcedureAction, updateProcedureStatusAction } from "./actions";

type ProcedureRow = {
  id: number;
  procedure_name: string;
  tooth_code: string | null;
  amount: number;
  paid_amount: number;
  status: string;
  created_at: string;
};

export default async function PatientProceduresPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let rows: ProcedureRow[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const res = await supabase
      .from("clinical_procedures")
      .select("id, procedure_name, tooth_code, amount, paid_amount, status, created_at")
      .eq("patient_id", Number(id))
      .order("created_at", { ascending: false })
      .limit(100);

    rows = res.data ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Patient · Actes</h2>
        <p className="text-sm text-slate-600">CRUD initial des actes cliniques.</p>
      </div>

      <form action={createProcedureAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
        <input type="hidden" name="patient_id" value={id} />
        <input name="procedure_name" required placeholder="Acte" className="rounded-md border px-3 py-2" />
        <input name="tooth_code" placeholder="Dent (ex: 16)" className="rounded-md border px-3 py-2" />
        <input name="amount" type="number" step="0.01" placeholder="Montant" className="rounded-md border px-3 py-2" />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white">Ajouter acte</button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Acte</th>
              <th className="px-3 py-2">Dent</th>
              <th className="px-3 py-2">Montant</th>
              <th className="px-3 py-2">Reçu</th>
              <th className="px-3 py-2">Reste</th>
              <th className="px-3 py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-3 text-slate-500">
                  Aucun acte.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-3 py-2">{r.procedure_name}</td>
                  <td className="px-3 py-2">{r.tooth_code || "—"}</td>
                  <td className="px-3 py-2">{r.amount}</td>
                  <td className="px-3 py-2">{r.paid_amount}</td>
                  <td className="px-3 py-2">{Math.max(0, Number(r.amount) - Number(r.paid_amount))}</td>
                  <td className="px-3 py-2">
                    <form action={updateProcedureStatusAction} className="flex gap-2">
                      <input type="hidden" name="patient_id" value={id} />
                      <input type="hidden" name="id" value={r.id} />
                      <select name="status" defaultValue={r.status} className="rounded-md border px-2 py-1">
                        <option value="en_attente">En attente</option>
                        <option value="en_cours">En cours</option>
                        <option value="fini">Fini</option>
                      </select>
                      <button className="rounded-md border px-2 py-1">OK</button>
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
