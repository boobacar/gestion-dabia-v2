import { hasSupabaseEnv } from "@/lib/env";
import { buildSimplePdf } from "@/lib/pdf/simple";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hasSupabaseEnv()) return new Response("Supabase non configuré", { status: 400 });

  const supabase = await createClient();

  const [{ data: plan }, { data: clinic }] = await Promise.all([
    supabase
      .from("treatment_plans")
      .select("id, patient_id, title, created_at")
      .eq("id", Number(id))
      .single(),
    supabase
      .from("clinic_profile")
      .select("name, address, phone, email, footer_note")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!plan) return new Response("Devis introuvable", { status: 404 });

  const [{ data: patient }, { data: items }] = await Promise.all([
    supabase.from("patients").select("first_name, last_name").eq("id", plan.patient_id).single(),
    supabase
      .from("treatment_plan_items")
      .select("label, amount, status")
      .eq("treatment_plan_id", plan.id)
      .order("created_at", { ascending: true }),
  ]);

  const total = (items ?? []).reduce((s, i) => s + Number(i.amount ?? 0), 0);
  const quoteRef = `DEV-${new Date(plan.created_at).getFullYear()}-${String(plan.id).padStart(4, "0")}`;
  const title = `${clinic?.name || "Clinique Dentaire Dabia"} — Devis ${quoteRef}`;

  const lines = [
    `Titre: ${plan.title}`,
    `Date: ${new Date(plan.created_at).toLocaleDateString("fr-FR")}`,
    `Patient: ${patient ? `${patient.first_name} ${patient.last_name}` : `#${plan.patient_id}`}`,
    "",
    ...(items ?? []).map((i) => `- ${i.label} | ${i.amount} CFA | ${i.status}`),
    "",
    `Total: ${total} CFA`,
    "",
    clinic?.footer_note || "",
  ];

  const bytes = await buildSimplePdf(title, lines);
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

  return new Response(ab, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quote-${plan.id}.pdf"`,
    },
  });
}
