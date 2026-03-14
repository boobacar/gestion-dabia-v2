import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hasSupabaseEnv()) return new Response("Supabase non configuré", { status: 400 });

  const supabase = await createClient();
  const { data: plan, error } = await supabase
    .from("treatment_plans")
    .select("id, patient_id, title, created_at")
    .eq("id", Number(id))
    .single();

  if (error || !plan) return new Response("Devis introuvable", { status: 404 });

  const [{ data: patient }, { data: items }] = await Promise.all([
    supabase.from("patients").select("first_name, last_name").eq("id", plan.patient_id).single(),
    supabase
      .from("treatment_plan_items")
      .select("label, amount, status")
      .eq("treatment_plan_id", plan.id)
      .order("created_at", { ascending: true }),
  ]);

  const rows = items ?? [];
  const total = rows.reduce((s, r) => s + Number(r.amount ?? 0), 0);

  const tableRows = rows
    .map((r) => `<tr><td>${r.label}</td><td>${r.amount} CFA</td><td>${r.status}</td></tr>`)
    .join("");

  const html = `<!doctype html>
<html><head><meta charset="utf-8"/><title>Devis ${plan.title}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#111}h1{margin:0 0 8px}table{width:100%;border-collapse:collapse;margin-top:18px}td,th{border:1px solid #ddd;padding:8px;text-align:left}.muted{color:#666;font-size:12px}</style>
</head><body>
<h1>Clinique Dentaire Dabia — Devis</h1>
<p><strong>Titre:</strong> ${plan.title}</p>
<p><strong>Patient:</strong> ${patient ? `${patient.first_name} ${patient.last_name}` : `#${plan.patient_id}`}</p>
<p class="muted">Date: ${new Date(plan.created_at).toLocaleDateString("fr-FR")}</p>
<table><tr><th>Acte</th><th>Montant</th><th>Statut</th></tr>${tableRows}</table>
<p><strong>Total:</strong> ${total} CFA</p>
<p class="muted">Imprimer via Ctrl/Cmd+P pour PDF.</p>
</body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
