import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { markMessageAsSentAction, retryMessageAction } from "./actions";

type MessageRow = {
  id: number;
  channel: "sms" | "whatsapp" | "email";
  message: string;
  status: "queued" | "sent" | "delivered" | "failed";
  sent_at: string | null;
  created_at: string;
  patients: { first_name: string; last_name: string } | null;
};

export default async function NotesPage() {
  let rows: MessageRow[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const res = await supabase
      .from("message_logs")
      .select("id, channel, message, status, sent_at, created_at, patients(first_name,last_name)")
      .order("created_at", { ascending: false })
      .limit(100);

    rows = (res.data as MessageRow[] | null) ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Rappels</h2>
        <p className="text-sm text-slate-600">Historique des rappels (WhatsApp/SMS/Email).</p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Patient</th>
              <th className="px-3 py-2">Canal</th>
              <th className="px-3 py-2">Message</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={6}>
                  Aucun rappel loggé.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="px-3 py-2">
                    {r.patients ? `${r.patients.first_name} ${r.patients.last_name}` : "—"}
                  </td>
                  <td className="px-3 py-2">{r.channel}</td>
                  <td className="px-3 py-2 max-w-md">{r.message}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">{new Date(r.created_at).toLocaleString("fr-FR")}</td>
                  <td className="px-3 py-2 space-y-2">
                    <form action={markMessageAsSentAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="rounded-md border px-2 py-1">Marquer envoyé</button>
                    </form>
                    {r.status === "failed" ? (
                      <form action={retryMessageAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="rounded-md border px-2 py-1">Retry</button>
                      </form>
                    ) : null}
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
