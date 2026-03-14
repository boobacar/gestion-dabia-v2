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

  const [{ data: patient }, { data: items }, { data: clinic }] = await Promise.all([
    supabase.from("patients").select("first_name, last_name").eq("id", plan.patient_id).single(),
    supabase
      .from("treatment_plan_items")
      .select("label, amount, status")
      .eq("treatment_plan_id", plan.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("clinic_profile")
      .select("name, address, phone, email, footer_note, logo_url, signature_url")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const rows = items ?? [];
  const total = rows.reduce((s, r) => s + Number(r.amount ?? 0), 0);

  const tableRows = rows
    .map((r) => `<tr><td>${r.label}</td><td>${r.amount} CFA</td><td>${r.status}</td></tr>`)
    .join("");

  const clinicName = clinic?.name || "Clinique Dentaire Dabia";
  const quoteRef = `DEV-${new Date(plan.created_at).getFullYear()}-${String(plan.id).padStart(4, "0")}`;

  const html = `<!doctype html>
<html><head><meta charset="utf-8"/><title>Devis ${plan.title}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#111}h1{margin:0 0 8px}.head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.logo{max-height:58px;max-width:180px;display:block;margin-bottom:8px}table{width:100%;border-collapse:collapse;margin-top:18px}td,th{border:1px solid #ddd;padding:8px;text-align:left}.muted{color:#666;font-size:12px}.footer{margin-top:24px;padding-top:12px;border-top:1px solid #ddd}.sign{margin-top:24px;text-align:right}.sign img{max-height:64px;max-width:180px;display:block;margin-left:auto}</style>
</head><body>
<div class="head"><div>${clinic?.logo_url ? `<img src="${clinic.logo_url}" class="logo" alt="logo"/>` : ""}<h1>${clinicName} — Devis ${quoteRef}</h1><p><strong>Titre:</strong> ${plan.title}</p></div><div class="muted">${clinic?.address || ""}<br/>${clinic?.phone || ""}<br/>${clinic?.email || ""}</div></div>
<p><strong>Patient:</strong> ${patient ? `${patient.first_name} ${patient.last_name}` : `#${plan.patient_id}`}</p>
<p class="muted">Date: ${new Date(plan.created_at).toLocaleDateString("fr-FR")}</p>
<table><tr><th>Acte</th><th>Montant</th><th>Statut</th></tr>${tableRows}</table>
<p><strong>Total:</strong> ${total} CFA</p>
<div class="sign">${clinic?.signature_url ? `<img src="${clinic.signature_url}" alt="signature"/>` : ""}<p class="muted">Signature / Cachet</p></div>
<div class="footer"><p class="muted">${clinic?.footer_note || "Imprimer via Ctrl/Cmd+P pour PDF."}</p></div>
</body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
