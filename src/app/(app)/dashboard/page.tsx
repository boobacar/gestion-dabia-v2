import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  let totalPatients = 0;
  let totalAppointments = 0;
  let totalInvoiced = 0;
  let totalReceived = 0;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();

    const [{ count: patientCount }, { count: appointmentCount }, invoicesRes, paymentsRes] = await Promise.all([
      supabase.from("patients").select("*", { count: "exact", head: true }),
      supabase.from("appointments").select("*", { count: "exact", head: true }),
      supabase.from("invoices").select("amount, paid_amount").limit(500),
      supabase.from("payments").select("amount").limit(500),
    ]);

    totalPatients = patientCount ?? 0;
    totalAppointments = appointmentCount ?? 0;
    totalInvoiced = (invoicesRes.data ?? []).reduce((s, i) => s + Number(i.amount ?? 0), 0);
    totalReceived = (paymentsRes.data ?? []).reduce((s, p) => s + Number(p.amount ?? 0), 0);
  }

  const totalRemaining = Math.max(0, totalInvoiced - totalReceived);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Tableau de bord</h2>
      <p className="text-sm text-slate-600">Vue globale cabinet: opérationnel + finance.</p>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Patients" value={String(totalPatients)} />
        <StatCard label="Rendez-vous" value={String(totalAppointments)} />
        <StatCard label="Facturé (CFA)" value={String(totalInvoiced)} />
        <StatCard label="Encaissé (CFA)" value={String(totalReceived)} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <StatCard label="Reste à payer (CFA)" value={String(totalRemaining)} />
        <StatCard
          label="Taux d'encaissement"
          value={`${totalInvoiced > 0 ? Math.round((totalReceived / totalInvoiced) * 100) : 0}%`}
        />
      </div>

      {!hasSupabaseEnv() ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Supabase non configuré: les compteurs affichent des valeurs par défaut.
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
