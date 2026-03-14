"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDocumentAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const patient_id = Number(formData.get("patient_id"));
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "custom");
  const invoice_id = Number(formData.get("invoice_id") || 0);
  const note = String(formData.get("note") ?? "").trim();

  if (!patient_id || !title) throw new Error("Paramètres invalides.");

  const supabase = await createClient();
  const { error } = await supabase.from("documents").insert({
    patient_id,
    title,
    type,
    invoice_id: invoice_id || null,
    note: note || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/patients/${patient_id}/documents`);
}
