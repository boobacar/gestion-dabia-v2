"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMedicalCertificateAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const patient_id = Number(formData.get("patient_id"));
  const title = String(formData.get("title") ?? "").trim();
  const rest_days = Number(formData.get("rest_days") || 0);
  const content = String(formData.get("content") ?? "").trim();
  const practitioner_name = String(formData.get("practitioner_name") ?? "").trim();
  const issued_on = String(formData.get("issued_on") ?? "").trim();

  if (!patient_id || !title) throw new Error("Paramètres invalides.");

  const supabase = await createClient();
  const { error } = await supabase.from("medical_certificates").insert({
    patient_id,
    title,
    rest_days: Number.isFinite(rest_days) ? rest_days : null,
    content: content || null,
    practitioner_name: practitioner_name || null,
    issued_on: issued_on || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/patients/${patient_id}/medical-certificates`);
  revalidatePath(`/patients/${patient_id}/documents`);
}
