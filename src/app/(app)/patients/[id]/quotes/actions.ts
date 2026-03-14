"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTreatmentPlanAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const patient_id = Number(formData.get("patient_id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!patient_id || !title) throw new Error("Paramètres invalides.");

  const supabase = await createClient();
  const { error } = await supabase.from("treatment_plans").insert({
    patient_id,
    title,
    status: "active",
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/patients/${patient_id}/quotes`);
}

export async function createTreatmentPlanItemAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const patient_id = Number(formData.get("patient_id"));
  const treatment_plan_id = Number(formData.get("treatment_plan_id"));
  const label = String(formData.get("label") ?? "").trim();
  const amount = Number(formData.get("amount") || 0);

  if (!patient_id || !treatment_plan_id || !label) throw new Error("Paramètres invalides.");

  const supabase = await createClient();
  const { error } = await supabase.from("treatment_plan_items").insert({
    treatment_plan_id,
    label,
    amount: Number.isFinite(amount) ? amount : 0,
    status: "pending",
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/patients/${patient_id}/quotes`);
}

export async function updateTreatmentPlanItemStatusAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const patient_id = Number(formData.get("patient_id"));
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");

  if (!patient_id || !id || !status) throw new Error("Paramètres invalides.");

  const supabase = await createClient();
  const { error } = await supabase.from("treatment_plan_items").update({ status }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/patients/${patient_id}/quotes`);
}
