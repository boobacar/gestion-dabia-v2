"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInvoiceAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const patient_id = Number(formData.get("patient_id"));
  const code = String(formData.get("code") ?? "").trim();
  const amount = Number(formData.get("amount") || 0);
  const due_date = String(formData.get("due_date") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!patient_id || amount <= 0) throw new Error("Montant facture invalide.");

  const supabase = await createClient();
  const { error } = await supabase.from("invoices").insert({
    patient_id,
    code: code || null,
    amount,
    paid_amount: 0,
    status: "draft",
    due_date: due_date || null,
    note: note || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/patients/${patient_id}/invoices`);
  revalidatePath(`/patients/${patient_id}/payments`);
  revalidatePath(`/patients/${patient_id}`);
}
