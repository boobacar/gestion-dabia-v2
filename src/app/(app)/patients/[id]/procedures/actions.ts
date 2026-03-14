"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProcedureAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const patient_id = Number(formData.get("patient_id"));
  const procedure_name = String(formData.get("procedure_name") ?? "").trim();
  const tooth_code = String(formData.get("tooth_code") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);

  if (!patient_id || !procedure_name) throw new Error("Paramètres invalides.");

  const supabase = await createClient();
  const { error } = await supabase.from("clinical_procedures").insert({
    patient_id,
    procedure_name,
    tooth_code: tooth_code || null,
    amount: Number.isFinite(amount) ? amount : 0,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/patients/${patient_id}/procedures`);
  revalidatePath(`/patients/${patient_id}`);
}

export async function updateProcedureStatusAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const patient_id = Number(formData.get("patient_id"));

  if (!id || !status || !patient_id) throw new Error("Paramètres invalides.");

  const supabase = await createClient();
  const { error } = await supabase.from("clinical_procedures").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/patients/${patient_id}/procedures`);
  revalidatePath(`/patients/${patient_id}`);
}
