import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  addToWaitingRoomAction,
  createAppointmentAction,
  queueReminderAction,
  updateAppointmentStatusAction,
} from "./actions";
import { AppointmentsCalendar } from "./calendar";

type AppointmentRow = {
  id: number;
  patient_id: number;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  status: "active" | "finished" | "absence" | "cancelled_by_patient" | "cancelled_by_practitioner";
  patients: { first_name: string; last_name: string } | null;
};

type PatientOption = { id: number; first_name: string; last_name: string };

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ patient_id?: string }>;
}) {
  const { patient_id } = await searchParams;
  let appointments: AppointmentRow[] = [];
  let patients: PatientOption[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();

    const [apptsRes, patientsRes] = await Promise.all([
      supabase
        .from("appointments")
        .select("id, patient_id, starts_at, ends_at, reason, status, patients(first_name, last_name)")
        .order("starts_at", { ascending: false })
        .limit(50),
      supabase.from("patients").select("id, first_name, last_name").order("created_at", { ascending: false }).limit(100),
    ]);

    appointments = (apptsRes.data as AppointmentRow[] | null) ?? [];
    patients = patientsRes.data ?? [];
  }

  const calendarEvents = appointments.map((a) => ({
    id: String(a.id),
    title: a.patients ? `${a.patients.first_name} ${a.patients.last_name}` : `Patient #${a.patient_id}`,
    start: a.starts_at,
    end: a.ends_at,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Rendez-Vous</h2>
        <p className="text-sm text-slate-600">Sprint 1: création, statuts, envoi en salle d’attente.</p>
      </div>

      <form action={createAppointmentAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
        <select
          name="patient_id"
          required
          defaultValue={patient_id ?? ""}
          className="rounded-md border px-3 py-2 md:col-span-2"
        >
          <option value="">Sélectionner patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.first_name} {p.last_name}
            </option>
          ))}
        </select>
        <input name="starts_at" type="datetime-local" required className="rounded-md border px-3 py-2" />
        <input name="ends_at" type="datetime-local" required className="rounded-md border px-3 py-2" />
        <input name="reason" placeholder="Motif" className="rounded-md border px-3 py-2" />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white md:col-span-5">Ajouter RDV</button>
      </form>

      <AppointmentsCalendar events={calendarEvents} />

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Patient</th>
              <th className="px-3 py-2">Début</th>
              <th className="px-3 py-2">Fin</th>
              <th className="px-3 py-2">Motif</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={6}>
                  Aucun rendez-vous.
                </td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.id} className="border-t align-top">
                  <td className="px-3 py-2">{a.patients ? `${a.patients.first_name} ${a.patients.last_name}` : `#${a.patient_id}`}</td>
                  <td className="px-3 py-2">{new Date(a.starts_at).toLocaleString("fr-FR")}</td>
                  <td className="px-3 py-2">{new Date(a.ends_at).toLocaleString("fr-FR")}</td>
                  <td className="px-3 py-2">{a.reason || "—"}</td>
                  <td className="px-3 py-2">
                    <form action={updateAppointmentStatusAction} className="flex gap-2">
                      <input type="hidden" name="id" value={a.id} />
                      <select name="status" defaultValue={a.status} className="rounded-md border px-2 py-1">
                        <option value="active">Actif</option>
                        <option value="finished">Fini</option>
                        <option value="absence">Absence</option>
                        <option value="cancelled_by_patient">Annulé patient</option>
                        <option value="cancelled_by_practitioner">Annulé praticien</option>
                      </select>
                      <button className="rounded-md border px-2 py-1">OK</button>
                    </form>
                  </td>
                  <td className="px-3 py-2 space-y-2">
                    <form action={addToWaitingRoomAction}>
                      <input type="hidden" name="appointment_id" value={a.id} />
                      <input type="hidden" name="patient_id" value={a.patient_id} />
                      <button className="rounded-md border px-2 py-1">Salle d’attente</button>
                    </form>
                    <form action={queueReminderAction}>
                      <input type="hidden" name="appointment_id" value={a.id} />
                      <input type="hidden" name="patient_id" value={a.patient_id} />
                      <input
                        type="hidden"
                        name="message"
                        value={`Rappel RDV: ${a.patients ? `${a.patients.first_name} ${a.patients.last_name}` : `Patient #${a.patient_id}`} le ${new Date(a.starts_at).toLocaleString("fr-FR")}`}
                      />
                      <button className="rounded-md border px-2 py-1">Rappel</button>
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
