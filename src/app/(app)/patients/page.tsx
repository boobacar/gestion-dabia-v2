import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { createPatientAction } from "./actions";

type PatientRow = {
  id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  created_at: string;
};

export default async function PatientsPage() {
  let patients: PatientRow[] = [];
  let error: string | null = null;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const result = await supabase
      .from("patients")
      .select("id, first_name, last_name, phone, created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    if (result.error) {
      error = result.error.message;
    } else {
      patients = result.data ?? [];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Patients</h2>
        <p className="text-sm text-slate-600">
          Première version CRUD patient pour lancer le Sprint 0.
        </p>
      </div>

      {!hasSupabaseEnv() ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Configure Supabase dans <code>.env.local</code> pour activer les données.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Erreur chargement patients: {error}
        </div>
      ) : null}

      <form action={createPatientAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
        <input
          name="first_name"
          placeholder="Prénom"
          required
          className="rounded-md border px-3 py-2"
        />
        <input
          name="last_name"
          placeholder="Nom"
          required
          className="rounded-md border px-3 py-2"
        />
        <input name="phone" placeholder="Téléphone" className="rounded-md border px-3 py-2" />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white">Ajouter patient</button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Nom complet</th>
              <th className="px-3 py-2">Téléphone</th>
              <th className="px-3 py-2">Créé le</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={3}>
                  Aucun patient pour le moment.
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id} className="border-t">
                  <td className="px-3 py-2">
                    <Link href={`/patients/${patient.id}`} className="underline underline-offset-2">
                      {patient.first_name} {patient.last_name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{patient.phone ?? "—"}</td>
                  <td className="px-3 py-2">
                    {new Date(patient.created_at).toLocaleDateString("fr-FR")}
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
