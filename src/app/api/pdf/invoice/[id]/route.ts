import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hasSupabaseEnv()) return new Response("Supabase non configuré", { status: 400 });

  const supabase = await createClient();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id, code, amount, paid_amount, status, due_date, note, created_at, patient_id")
    .eq("id", Number(id))
    .single();

  if (error || !invoice) return new Response("Facture introuvable", { status: 404 });

  const { data: patient } = await supabase
    .from("patients")
    .select("first_name, last_name, phone, email")
    .eq("id", invoice.patient_id)
    .single();

  const remaining = Math.max(0, Number(invoice.amount) - Number(invoice.paid_amount));

  const html = `<!doctype html>
<html><head><meta charset="utf-8"/><title>Facture ${invoice.code || `#${invoice.id}`}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#111}h1{margin:0 0 8px}table{width:100%;border-collapse:collapse;margin-top:18px}td,th{border:1px solid #ddd;padding:8px;text-align:left}.muted{color:#666;font-size:12px}</style>
</head><body>
<h1>Clinique Dentaire Dabia — Facture ${invoice.code || `#${invoice.id}`}</h1>
<p class="muted">Date: ${new Date(invoice.created_at).toLocaleDateString("fr-FR")}</p>
<p><strong>Patient:</strong> ${patient ? `${patient.first_name} ${patient.last_name}` : `#${invoice.patient_id}`}</p>
<table><tr><th>Montant</th><th>Reçu</th><th>Reste</th><th>Statut</th></tr>
<tr><td>${invoice.amount} CFA</td><td>${invoice.paid_amount} CFA</td><td>${remaining} CFA</td><td>${invoice.status}</td></tr></table>
${invoice.note ? `<p><strong>Note:</strong> ${invoice.note}</p>` : ""}
<p class="muted">Imprimer via Ctrl/Cmd+P pour PDF.</p>
</body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
