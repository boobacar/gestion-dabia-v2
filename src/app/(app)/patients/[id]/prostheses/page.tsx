import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createProsthesisAction } from "./actions";

type ProsthesisRow = {
  id: number;
  title: string | null;
  lab_name: string | null;
  amount: number;
  status: string;
  due_date: string | null;
  created_at: string;
};

export default async function PatientProsthesesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let rows: ProsthesisRow[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const res = await supabase
      .from("prostheses")
      .select("id, title, lab_name, amount, status, due_date, created_at")
      .eq("patient_id", Number(id))
      .order("created_at", { ascending: false })
      .limit(100);

    rows = res.data ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Patient · Prothèses</h2>
        <p className="text-sm text-slate-600">Suivi labo, statut et échéance prothèses.</p>
      </div>

      <form action={createProsthesisAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
        <input type="hidden" name="patient_id" value={id} />
        <input name="title" required placeholder="Intitulé prothèse" className="rounded-md border px-3 py-2" />
        <input name="lab_name" placeholder="Laboratoire" className="rounded-md border px-3 py-2" />
        <input name="amount" type="number" step="0.01" placeholder="Montant" className="rounded-md border px-3 py-2" />
        <select name="status" className="rounded-md border px-3 py-2">
          <option value="ordered">Commandée</option>
          <option value="in_progress">En cours</option>
          <option value="ready">Prête</option>
          <option value="fitted">Posée</option>
        </select>
        <input name="due_date" type="date" className="rounded-md border px-3 py-2" />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white md:col-span-4">Ajouter prothèse</button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Prothèse</th>
              <th className="px-3 py-2">Labo</th>
              <th className="px-3 py-2">Montant</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Échéance</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-3 text-slate-500">
                  Aucune prothèse.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-3 py-2">{r.title || "—"}</td>
                  <td className="px-3 py-2">{r.lab_name || "—"}</td>
                  <td className="px-3 py-2">{r.amount}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">{r.due_date ? new Date(r.due_date).toLocaleDateString("fr-FR") : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
