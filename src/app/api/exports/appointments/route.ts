import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (!hasSupabaseEnv()) return new Response("Supabase non configuré", { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, patient_id, starts_at, ends_at, status, reason, created_at")
    .order("starts_at", { ascending: false })
    .limit(5000);

  if (error) return new Response(error.message, { status: 500 });

  const rows = [
    ["id", "patient_id", "starts_at", "ends_at", "status", "reason", "created_at"],
    ...(data ?? []).map((a) => [a.id, a.patient_id, a.starts_at, a.ends_at, a.status, a.reason ?? "", a.created_at]),
  ];

  const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=appointments.csv",
    },
  });
}
