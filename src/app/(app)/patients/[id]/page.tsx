import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    return (
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">Fiche patient #{id}</h2>
        <p className="text-sm text-slate-600">
          Supabase non configuré. Mets en place <code>.env.local</code> pour charger les données.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: patient, error }, appointmentsRes, proceduresRes, paymentsRes] = await Promise.all([
    supabase
      .from("patients")
      .select("id, first_name, last_name, phone, email, city, address, insurance_name, notes")
      .eq("id", Number(id))
      .single(),
    supabase
      .from("appointments")
      .select("id, starts_at, status")
      .eq("patient_id", Number(id))
      .order("starts_at", { ascending: false })
      .limit(5),
    supabase
      .from("clinical_procedures")
      .select("id, procedure_name, created_at, status")
      .eq("patient_id", Number(id))
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("payments")
      .select("id, amount, paid_at")
      .eq("patient_id", Number(id))
      .order("paid_at", { ascending: false })
      .limit(5),
  ]);

  if (error || !patient) {
    notFound();
  }

  const timeline = [
    ...((appointmentsRes.data ?? []).map((a) => ({
      type: "RDV",
      date: a.starts_at,
      label: `Rendez-vous (${a.status})`,
    })) as Array<{ type: string; date: string; label: string }>),
    ...((proceduresRes.data ?? []).map((p) => ({
      type: "Acte",
      date: p.created_at,
      label: `${p.procedure_name} (${p.status})`,
    })) as Array<{ type: string; date: string; label: string }>),
    ...((paymentsRes.data ?? []).map((p) => ({
      type: "Paiement",
      date: p.paid_at,
      label: `${p.amount} CFA encaissé`,
    })) as Array<{ type: string; date: string; label: string }>),
  ]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 12);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">
          {patient.first_name} {patient.last_name}
        </h2>
        <p className="text-sm text-slate-600">Fiche patient (cockpit v2 en construction).</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Info label="Téléphone" value={patient.phone} />
        <Info label="Email" value={patient.email} />
        <Info label="Ville" value={patient.city} />
        <Info label="Adresse" value={patient.address} />
        <Info label="Assurance" value={patient.insurance_name} />
      </div>

      <div className="rounded-lg border p-3">
        <p className="mb-1 text-sm font-medium">Notes</p>
        <p className="text-sm text-slate-700">{patient.notes || "Aucune note."}</p>
      </div>

      <div className="rounded-lg border p-3">
        <p className="mb-2 text-sm font-medium">Timeline patient (RDV / Actes / Paiements)</p>
        <div className="space-y-2">
          {timeline.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun événement récent.</p>
          ) : (
            timeline.map((item, idx) => (
              <div key={`${item.type}-${idx}`} className="rounded-md bg-slate-50 px-3 py-2 text-sm">
                <span className="mr-2 inline-block rounded bg-slate-200 px-2 py-0.5 text-xs">{item.type}</span>
                {item.label}
                <span className="ml-2 text-xs text-slate-500">
                  {new Date(item.date).toLocaleString("fr-FR")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <QuickLink href={`/appointments?patient_id=${id}`} label="Nouveau RDV" />
        <QuickLink href={`/patients/${id}/appointments`} label="Rendez-vous" />
        <QuickLink href={`/patients/${id}/procedures`} label="Actes" />
        <QuickLink href={`/patients/${id}/payments`} label="Paiements" />
        <QuickLink href={`/patients/${id}/quotes`} label="Devis" />
        <QuickLink href={`/patients/${id}/waiting-room-visits`} label="Salle d'attente" />
        <QuickLink href={`/patients/${id}/documents`} label="Documents" />
        {patient.phone ? (
          <a href={`https://wa.me/${patient.phone.replace(/\D/g, "")}`} className="rounded-md border px-3 py-2 text-sm hover:bg-slate-100">
            WhatsApp
          </a>
        ) : null}
        {patient.email ? (
          <a href={`mailto:${patient.email}`} className="rounded-md border px-3 py-2 text-sm hover:bg-slate-100">
            Email
          </a>
        ) : null}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-md border px-3 py-2 text-sm hover:bg-slate-100">
      {label}
    </Link>
  );
}
