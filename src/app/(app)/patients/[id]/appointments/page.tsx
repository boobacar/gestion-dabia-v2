import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type AppointmentRow = {
  id: number;
  starts_at: string;
  ends_at: string;
  status: string;
  reason: string | null;
};

export default async function PatientAppointmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let rows: AppointmentRow[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const res = await supabase
      .from("appointments")
      .select("id, starts_at, ends_at, status, reason")
      .eq("patient_id", Number(id))
      .order("starts_at", { ascending: false })
      .limit(50);
    rows = res.data ?? [];
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Patient · Rendez-vous</h2>
        <Link href={`/appointments?patient_id=${id}`} className="rounded-md border px-3 py-2 text-sm">
          Nouveau RDV
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Début</th>
              <th className="px-3 py-2">Fin</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Motif</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={4}>
                  Aucun rendez-vous pour ce patient.
                </td>
              </tr>
            ) : (
              rows.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-2">{new Date(a.starts_at).toLocaleString("fr-FR")}</td>
                  <td className="px-3 py-2">{new Date(a.ends_at).toLocaleString("fr-FR")}</td>
                  <td className="px-3 py-2">{a.status}</td>
                  <td className="px-3 py-2">{a.reason || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
