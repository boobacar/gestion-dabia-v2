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
  const { data: patient, error } = await supabase
    .from("patients")
    .select("id, first_name, last_name, phone, email, city, address, insurance_name, notes")
    .eq("id", Number(id))
    .single();

  if (error || !patient) {
    notFound();
  }

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

      <div className="flex flex-wrap gap-2">
        <QuickLink href={`/patients/${id}/appointments`} label="Rendez-vous" />
        <QuickLink href={`/patients/${id}/procedures`} label="Actes" />
        <QuickLink href={`/patients/${id}/payments`} label="Paiements" />
        <QuickLink href={`/patients/${id}/quotes`} label="Devis" />
        <QuickLink href={`/patients/${id}/documents`} label="Documents" />
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
