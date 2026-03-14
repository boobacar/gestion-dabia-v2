"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPrescriptionAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const patient_id = Number(formData.get("patient_id"));
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const practitioner_name = String(formData.get("practitioner_name") ?? "").trim();

  if (!patient_id || !title) throw new Error("Paramètres invalides.");

  const supabase = await createClient();
  const { error } = await supabase.from("prescriptions").insert({
    patient_id,
    title,
    content: content || null,
    practitioner_name: practitioner_name || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/patients/${patient_id}/prescriptions`);
  revalidatePath(`/patients/${patient_id}/documents`);
}
