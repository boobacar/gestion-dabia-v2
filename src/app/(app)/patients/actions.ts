"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPatientAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    throw new Error("Configure Supabase (.env.local) pour créer un patient.");
  }

  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!first_name || !last_name) {
    throw new Error("Prénom et nom sont obligatoires.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("patients")
    .insert({ first_name, last_name, phone: phone || null });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/patients");
}
