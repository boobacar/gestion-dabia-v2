import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createPrescriptionAction } from "./actions";

type PrescriptionRow = {
  id: number;
  title: string | null;
  content: string | null;
  practitioner_name: string | null;
  created_at: string;
};

export default async function PatientPrescriptionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let rows: PrescriptionRow[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const res = await supabase
      .from("prescriptions")
      .select("id, title, content, practitioner_name, created_at")
      .eq("patient_id", Number(id))
      .order("created_at", { ascending: false })
      .limit(100);

    rows = res.data ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Patient · Ordonnances</h2>
        <p className="text-sm text-slate-600">Création et suivi des prescriptions.</p>
      </div>

      <form action={createPrescriptionAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
        <input type="hidden" name="patient_id" value={id} />
        <input name="title" required placeholder="Titre ordonnance" className="rounded-md border px-3 py-2 md:col-span-2" />
        <input name="practitioner_name" placeholder="Praticien" className="rounded-md border px-3 py-2" />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white">Créer</button>
        <textarea name="content" placeholder="Contenu" rows={4} className="rounded-md border px-3 py-2 md:col-span-4" />
      </form>

      <div className="space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-lg border p-3 text-sm text-slate-500">Aucune ordonnance.</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{r.title || `Ordonnance #${r.id}`}</p>
                <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString("fr-FR")}</span>
              </div>
              <p className="text-sm text-slate-600">Praticien: {r.practitioner_name || "—"}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{r.content || "—"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
