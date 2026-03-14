"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveClinicProfileAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const name = String(formData.get("name") ?? "").trim() || "Clinique Dentaire Dabia";
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const footer_note = String(formData.get("footer_note") ?? "").trim();

  const supabase = await createClient();
  const { data: first } = await supabase
    .from("clinic_profile")
    .select("id")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (first?.id) {
    await supabase
      .from("clinic_profile")
      .update({ name, address: address || null, phone: phone || null, email: email || null, footer_note: footer_note || null, updated_at: new Date().toISOString() })
      .eq("id", first.id);
  } else {
    await supabase.from("clinic_profile").insert({ name, address: address || null, phone: phone || null, email: email || null, footer_note: footer_note || null });
  }

  revalidatePath("/settings/profile");
}
