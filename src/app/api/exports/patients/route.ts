import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (!hasSupabaseEnv()) {
    return new Response("Supabase non configuré", { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .select("id, first_name, last_name, phone, email, city, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) return new Response(error.message, { status: 500 });

  const rows = [
    ["id", "first_name", "last_name", "phone", "email", "city", "created_at"],
    ...(data ?? []).map((p) => [p.id, p.first_name, p.last_name, p.phone ?? "", p.email ?? "", p.city ?? "", p.created_at]),
  ];

  const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=patients.csv",
    },
  });
}
