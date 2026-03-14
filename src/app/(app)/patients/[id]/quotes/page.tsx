import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  createTreatmentPlanAction,
  createTreatmentPlanItemAction,
  generateQuotePdfDocumentAction,
  updateTreatmentPlanItemStatusAction,
} from "./actions";

type Plan = { id: number; title: string; status: string; created_at: string };
type PlanItem = { id: number; treatment_plan_id: number; label: string; amount: number; status: string };

export default async function PatientQuotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let plans: Plan[] = [];
  let items: PlanItem[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const [plansRes, itemsRes] = await Promise.all([
      supabase
        .from("treatment_plans")
        .select("id, title, status, created_at")
        .eq("patient_id", Number(id))
        .order("created_at", { ascending: false }),
      supabase
        .from("treatment_plan_items")
        .select("id, treatment_plan_id, label, amount, status")
        .order("created_at", { ascending: false }),
    ]);

    plans = plansRes.data ?? [];
    items = (itemsRes.data ?? []).filter((i) => plans.some((p) => p.id === i.treatment_plan_id));
  }

  const itemsByPlan = new Map<number, PlanItem[]>();
  for (const it of items) {
    const arr = itemsByPlan.get(it.treatment_plan_id) ?? [];
    arr.push(it);
    itemsByPlan.set(it.treatment_plan_id, arr);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Patient · Devis / Plans de traitement</h2>
        <p className="text-sm text-slate-600">Plans, items, progression et montants.</p>
      </div>

      <form action={createTreatmentPlanAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
        <input type="hidden" name="patient_id" value={id} />
        <input name="title" required placeholder="Titre du plan" className="rounded-md border px-3 py-2 md:col-span-3" />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white">Créer plan</button>
      </form>

      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm text-slate-500">Aucun plan de traitement.</div>
        ) : (
          plans.map((plan) => {
            const planItems = itemsByPlan.get(plan.id) ?? [];
            const total = planItems.reduce((sum, i) => sum + Number(i.amount), 0);
            const done = planItems.filter((i) => i.status === "done").length;
            const progress = planItems.length ? Math.round((done / planItems.length) * 100) : 0;

            return (
              <div key={plan.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{plan.title}</p>
                    <p className="text-xs text-slate-500">{new Date(plan.created_at).toLocaleString("fr-FR")}</p>
                  </div>
                  <div className="text-sm flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-1">Total: {total} CFA</span>
                    <span className="rounded bg-slate-100 px-2 py-1">Progression: {progress}%</span>
                    <a href={`/api/pdf/quote/${plan.id}`} target="_blank" className="rounded border px-2 py-1">
                      Aperçu
                    </a>
                    <a href={`/api/pdfbin/quote/${plan.id}`} className="rounded border px-2 py-1">
                      Télécharger PDF
                    </a>
                    <form action={generateQuotePdfDocumentAction}>
                      <input type="hidden" name="patient_id" value={id} />
                      <input type="hidden" name="treatment_plan_id" value={plan.id} />
                      <button className="rounded border px-2 py-1">Ajouter aux documents</button>
                    </form>
                  </div>
                </div>

                <form action={createTreatmentPlanItemAction} className="grid gap-2 md:grid-cols-4">
                  <input type="hidden" name="patient_id" value={id} />
                  <input type="hidden" name="treatment_plan_id" value={plan.id} />
                  <input name="label" required placeholder="Acte/ligne" className="rounded-md border px-3 py-2 md:col-span-2" />
                  <input name="amount" type="number" step="0.01" placeholder="Montant" className="rounded-md border px-3 py-2" />
                  <button className="rounded-md border px-3 py-2">Ajouter item</button>
                </form>

                <div className="overflow-x-auto rounded border">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-left">
                      <tr>
                        <th className="px-3 py-2">Libellé</th>
                        <th className="px-3 py-2">Montant</th>
                        <th className="px-3 py-2">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planItems.length === 0 ? (
                        <tr>
                          <td className="px-3 py-3 text-slate-500" colSpan={3}>
                            Aucun item.
                          </td>
                        </tr>
                      ) : (
                        planItems.map((it) => (
                          <tr key={it.id} className="border-t">
                            <td className="px-3 py-2">{it.label}</td>
                            <td className="px-3 py-2">{it.amount}</td>
                            <td className="px-3 py-2">
                              <form action={updateTreatmentPlanItemStatusAction} className="flex gap-2">
                                <input type="hidden" name="patient_id" value={id} />
                                <input type="hidden" name="id" value={it.id} />
                                <select name="status" defaultValue={it.status} className="rounded-md border px-2 py-1">
                                  <option value="pending">En attente</option>
                                  <option value="in_progress">En cours</option>
                                  <option value="done">Fini</option>
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
          })
        )}
      </div>
    </div>
  );
}
