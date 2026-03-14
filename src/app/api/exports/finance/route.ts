import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (!hasSupabaseEnv()) return new Response("Supabase non configuré", { status: 400 });

  const supabase = await createClient();
  const [invoicesRes, paymentsRes] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, patient_id, code, amount, paid_amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("payments")
      .select("id, patient_id, invoice_id, amount, method, paid_at")
      .order("paid_at", { ascending: false })
      .limit(5000),
  ]);

  if (invoicesRes.error) return new Response(invoicesRes.error.message, { status: 500 });
  if (paymentsRes.error) return new Response(paymentsRes.error.message, { status: 500 });

  const invoiceRows = [
    ["section", "id", "patient_id", "code", "amount", "paid_amount", "status", "date"],
    ...(invoicesRes.data ?? []).map((i) => ["invoice", i.id, i.patient_id, i.code ?? "", i.amount, i.paid_amount, i.status, i.created_at]),
    ...(paymentsRes.data ?? []).map((p) => ["payment", p.id, p.patient_id, p.invoice_id ?? "", p.amount, "", p.method ?? "", p.paid_at]),
  ];

  const csv = invoiceRows
    .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=finance.csv",
    },
  });
}
