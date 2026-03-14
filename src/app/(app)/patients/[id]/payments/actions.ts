"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPaymentAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const patient_id = Number(formData.get("patient_id"));
  const invoice_id = Number(formData.get("invoice_id") || 0);
  const amount = Number(formData.get("amount") || 0);
  const method = String(formData.get("method") ?? "").trim();

  if (!patient_id || amount <= 0) throw new Error("Montant invalide.");

  const supabase = await createClient();

  const { error } = await supabase.from("payments").insert({
    patient_id,
    invoice_id: invoice_id || null,
    amount,
    method: method || null,
  });
  if (error) throw new Error(error.message);

  if (invoice_id) {
    const { data: invoice } = await supabase.from("invoices").select("paid_amount").eq("id", invoice_id).single();
    const nextPaid = Number(invoice?.paid_amount ?? 0) + amount;
    await supabase.from("invoices").update({ paid_amount: nextPaid }).eq("id", invoice_id);
  }

  revalidatePath(`/patients/${patient_id}/payments`);
  revalidatePath(`/patients/${patient_id}/invoices`);
  revalidatePath(`/patients/${patient_id}`);
}
