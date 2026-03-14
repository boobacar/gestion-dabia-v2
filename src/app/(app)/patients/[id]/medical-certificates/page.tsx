import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createMedicalCertificateAction } from "./actions";

type CertRow = {
  id: number;
  title: string;
  rest_days: number | null;
  practitioner_name: string | null;
  issued_on: string;
  content: string | null;
};

export default async function PatientMedicalCertificatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let rows: CertRow[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const res = await supabase
      .from("medical_certificates")
      .select("id, title, rest_days, practitioner_name, issued_on, content")
      .eq("patient_id", Number(id))
      .order("issued_on", { ascending: false })
      .limit(100);

    rows = res.data ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Patient · Certificats médicaux</h2>
        <p className="text-sm text-slate-600">Création et historique des certificats.</p>
      </div>

      <form action={createMedicalCertificateAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
        <input type="hidden" name="patient_id" value={id} />
        <input name="title" required placeholder="Titre certificat" className="rounded-md border px-3 py-2" />
        <input name="practitioner_name" placeholder="Praticien" className="rounded-md border px-3 py-2" />
        <input name="rest_days" type="number" placeholder="Jours de repos" className="rounded-md border px-3 py-2" />
        <input name="issued_on" type="date" className="rounded-md border px-3 py-2" />
        <textarea name="content" rows={4} placeholder="Contenu" className="rounded-md border px-3 py-2 md:col-span-3" />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white">Créer</button>
      </form>

      <div className="space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-lg border p-3 text-sm text-slate-500">Aucun certificat.</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{r.title}</p>
                <span className="text-xs text-slate-500">{new Date(r.issued_on).toLocaleDateString("fr-FR")}</span>
              </div>
              <p className="text-sm text-slate-600">
                Praticien: {r.practitioner_name || "—"} · Repos: {r.rest_days ?? 0} jour(s)
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{r.content || "—"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
