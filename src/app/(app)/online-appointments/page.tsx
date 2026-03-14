import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  convertOnlineAppointmentAction,
  createOnlineAppointmentAction,
  updateOnlineAppointmentStatusAction,
} from "./actions";

type OnlineRow = {
  id: number;
  patient_name: string;
  phone: string | null;
  email: string | null;
  requested_at: string | null;
  status: "pending" | "validated" | "untreated" | "unvalidated" | "absence" | "draft";
  created_at: string;
};

export default async function OnlineAppointmentsPage() {
  let rows: OnlineRow[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const res = await supabase
      .from("online_appointments")
      .select("id, patient_name, phone, email, requested_at, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    rows = (res.data as OnlineRow[] | null) ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Réservation en ligne</h2>
        <p className="text-sm text-slate-600">Triage secrétaire et conversion en RDV confirmé.</p>
      </div>

      <form action={createOnlineAppointmentAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
        <input name="patient_name" required placeholder="Nom complet" className="rounded-md border px-3 py-2" />
        <input name="phone" placeholder="Téléphone" className="rounded-md border px-3 py-2" />
        <input name="email" type="email" placeholder="Email" className="rounded-md border px-3 py-2" />
        <input name="requested_at" type="datetime-local" className="rounded-md border px-3 py-2" />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white">Ajouter demande</button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Patient</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Créneau demandé</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>
                  Aucune demande.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="px-3 py-2">{r.patient_name}</td>
                  <td className="px-3 py-2">{r.phone || r.email || "—"}</td>
                  <td className="px-3 py-2">{r.requested_at ? new Date(r.requested_at).toLocaleString("fr-FR") : "—"}</td>
                  <td className="px-3 py-2">
                    <form action={updateOnlineAppointmentStatusAction} className="flex gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <select name="status" defaultValue={r.status} className="rounded-md border px-2 py-1">
                        <option value="pending">En attente</option>
                        <option value="validated">Valide</option>
                        <option value="untreated">Non traité</option>
                        <option value="unvalidated">Non validé</option>
                        <option value="absence">Absence</option>
                        <option value="draft">Brouillon</option>
                      </select>
                      <button className="rounded-md border px-2 py-1">OK</button>
                    </form>
                  </td>
                  <td className="px-3 py-2">
                    <form action={convertOnlineAppointmentAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="rounded-md border px-2 py-1">Convertir en RDV</button>
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
}
