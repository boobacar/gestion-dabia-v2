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
  let logo_url = String(formData.get("logo_url") ?? "").trim();
  let signature_url = String(formData.get("signature_url") ?? "").trim();

  const logo_file = formData.get("logo_file");
  const signature_file = formData.get("signature_file");

  const supabase = await createClient();

  if (logo_file instanceof File && logo_file.size > 0) {
    const filePath = `logo-${Date.now()}-${logo_file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("branding")
      .upload(filePath, logo_file, { upsert: true, contentType: logo_file.type || "image/png" });

    if (!uploadError) {
      const { data } = supabase.storage.from("branding").getPublicUrl(filePath);
      logo_url = data.publicUrl;
    }
  }

  if (signature_file instanceof File && signature_file.size > 0) {
    const filePath = `signature-${Date.now()}-${signature_file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("branding")
      .upload(filePath, signature_file, { upsert: true, contentType: signature_file.type || "image/png" });

    if (!uploadError) {
      const { data } = supabase.storage.from("branding").getPublicUrl(filePath);
      signature_url = data.publicUrl;
    }
  }
  const { data: first } = await supabase
    .from("clinic_profile")
    .select("id")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (first?.id) {
    await supabase
      .from("clinic_profile")
      .update({
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        footer_note: footer_note || null,
        logo_url: logo_url || null,
        signature_url: signature_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", first.id);
  } else {
    await supabase.from("clinic_profile").insert({
      name,
      address: address || null,
      phone: phone || null,
      email: email || null,
      footer_note: footer_note || null,
      logo_url: logo_url || null,
      signature_url: signature_url || null,
    });
  }

  revalidatePath("/settings/profile");
}
