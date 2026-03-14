"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProsthesisAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const patient_id = Number(formData.get("patient_id"));
  const title = String(formData.get("title") ?? "").trim();
  const lab_name = String(formData.get("lab_name") ?? "").trim();
  const amount = Number(formData.get("amount") || 0);
  const status = String(formData.get("status") ?? "ordered");
  const due_date = String(formData.get("due_date") ?? "").trim();

  if (!patient_id || !title) throw new Error("Paramètres invalides.");

  const supabase = await createClient();
  const { error } = await supabase.from("prostheses").insert({
    patient_id,
    title,
    lab_name: lab_name || null,
    amount: Number.isFinite(amount) ? amount : 0,
    status,
    due_date: due_date || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/patients/${patient_id}/prostheses`);
}
