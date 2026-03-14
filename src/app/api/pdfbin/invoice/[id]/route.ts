import { hasSupabaseEnv } from "@/lib/env";
import { buildSimplePdf } from "@/lib/pdf/simple";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hasSupabaseEnv()) return new Response("Supabase non configuré", { status: 400 });

  const supabase = await createClient();
  const [{ data: invoice }, { data: clinic }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, code, amount, paid_amount, status, due_date, note, created_at, patient_id")
      .eq("id", Number(id))
      .single(),
    supabase
      .from("clinic_profile")
      .select("name, address, phone, email, footer_note")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!invoice) return new Response("Facture introuvable", { status: 404 });

  const { data: patient } = await supabase
    .from("patients")
    .select("first_name, last_name, phone, email")
    .eq("id", invoice.patient_id)
    .single();

  const remaining = Math.max(0, Number(invoice.amount) - Number(invoice.paid_amount));
  const title = `${clinic?.name || "Clinique Dentaire Dabia"} — Facture ${invoice.code || `#${invoice.id}`}`;

  const lines = [
    `Date: ${new Date(invoice.created_at).toLocaleDateString("fr-FR")}`,
    clinic?.address ? `Adresse: ${clinic.address}` : "",
    clinic?.phone ? `Téléphone: ${clinic.phone}` : "",
    clinic?.email ? `Email: ${clinic.email}` : "",
    "",
    `Patient: ${patient ? `${patient.first_name} ${patient.last_name}` : `#${invoice.patient_id}`}`,
    "",
    `Montant: ${invoice.amount} CFA`,
    `Reçu: ${invoice.paid_amount} CFA`,
    `Reste: ${remaining} CFA`,
    `Statut: ${invoice.status}`,
    invoice.note ? `Note: ${invoice.note}` : "",
    "",
    clinic?.footer_note || "",
  ].filter(Boolean);

  const bytes = await buildSimplePdf(title, lines);
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

  return new Response(ab, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${invoice.id}.pdf"`,
    },
  });
}
