"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createOnlineAppointmentAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const patient_name = String(formData.get("patient_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const requested_at = String(formData.get("requested_at") ?? "").trim();

  if (!patient_name) throw new Error("Nom patient obligatoire.");

  const supabase = await createClient();
  const { error } = await supabase.from("online_appointments").insert({
    patient_name,
    phone: phone || null,
    email: email || null,
    requested_at: requested_at || null,
    status: "pending",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/online-appointments");
}

export async function updateOnlineAppointmentStatusAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");

  if (!id || !status) throw new Error("Paramètres invalides.");

  const supabase = await createClient();
  const { error } = await supabase.from("online_appointments").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/online-appointments");
}

export async function convertOnlineAppointmentAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const id = Number(formData.get("id"));
  if (!id) throw new Error("ID invalide.");

  const supabase = await createClient();

  const { data: oa, error: oaError } = await supabase
    .from("online_appointments")
    .select("id, patient_name, phone, email, requested_at")
    .eq("id", id)
    .single();

  if (oaError || !oa) throw new Error(oaError?.message || "Demande introuvable.");

  const [first_name, ...rest] = oa.patient_name.split(" ");
  const last_name = rest.join(" ") || "Patient";

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .insert({
      first_name: first_name || "Patient",
      last_name,
      phone: oa.phone,
      email: oa.email,
    })
    .select("id")
    .single();

  if (patientError || !patient) throw new Error(patientError?.message || "Création patient impossible.");

  const starts_at = oa.requested_at || new Date().toISOString();
  const ends_at = new Date(new Date(starts_at).getTime() + 30 * 60 * 1000).toISOString();

  const { error: apptError } = await supabase.from("appointments").insert({
    patient_id: patient.id,
    starts_at,
    ends_at,
    reason: "RDV converti depuis réservation en ligne",
    status: "active",
  });

  if (apptError) throw new Error(apptError.message);

  const { error: statusError } = await supabase
    .from("online_appointments")
    .update({ status: "validated" })
    .eq("id", id);

  if (statusError) throw new Error(statusError.message);

  revalidatePath("/online-appointments");
  revalidatePath("/appointments");
  revalidatePath("/patients");
}
