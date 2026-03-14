import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { updateWaitingRoomStatusAction } from "./actions";

type VisitRow = {
  id: number;
  patient_id: number;
  status: "waiting" | "in_progress" | "done" | "cancelled";
  arrived_at: string;
  reason: string | null;
  patients: { first_name: string; last_name: string } | null;
};

export default async function WaitingRoomPage() {
  let visits: VisitRow[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const res = await supabase
      .from("waiting_room_visits")
      .select("id, patient_id, status, arrived_at, reason, patients(first_name,last_name)")
      .order("arrived_at", { ascending: false })
      .limit(50);
    visits = (res.data as VisitRow[] | null) ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Salle d’attente</h2>
        <p className="text-sm text-slate-600">Flux secrétaire en temps réel (waiting/in_progress/done).</p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Patient</th>
              <th className="px-3 py-2">Arrivée</th>
              <th className="px-3 py-2">Motif</th>
              <th className="px-3 py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={4}>
                  Aucun patient en salle d’attente.
                </td>
              </tr>
            ) : (
              visits.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="px-3 py-2">{v.patients ? `${v.patients.first_name} ${v.patients.last_name}` : `#${v.patient_id}`}</td>
                  <td className="px-3 py-2">{new Date(v.arrived_at).toLocaleString("fr-FR")}</td>
                  <td className="px-3 py-2">{v.reason || "—"}</td>
                  <td className="px-3 py-2">
                    <form action={updateWaitingRoomStatusAction} className="flex gap-2">
                      <input type="hidden" name="id" value={v.id} />
                      <select name="status" defaultValue={v.status} className="rounded-md border px-2 py-1">
                        <option value="waiting">En attente</option>
                        <option value="in_progress">En cours</option>
                        <option value="done">Terminé</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                      <button className="rounded-md border px-2 py-1">OK</button>
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
