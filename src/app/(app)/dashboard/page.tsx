import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  let totalPatients = 0;
  let totalAppointments = 0;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();

    const [{ count: patientCount }, { count: appointmentCount }] = await Promise.all([
      supabase.from("patients").select("*", { count: "exact", head: true }),
      supabase.from("appointments").select("*", { count: "exact", head: true }),
    ]);

    totalPatients = patientCount ?? 0;
    totalAppointments = appointmentCount ?? 0;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Tableau de bord</h2>
      <p className="text-sm text-slate-600">Base Sprint 0: stats clés + navigation rapide.</p>

      <div className="grid gap-3 md:grid-cols-2">
        <StatCard label="Patients" value={String(totalPatients)} />
        <StatCard label="Rendez-vous" value={String(totalAppointments)} />
      </div>

      {!hasSupabaseEnv() ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Supabase non configuré: les compteurs affichent 0.
        </p>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
