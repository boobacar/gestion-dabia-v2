"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAppointmentAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const patient_id = Number(formData.get("patient_id"));
  const starts_at = String(formData.get("starts_at") ?? "");
  const ends_at = String(formData.get("ends_at") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!patient_id || !starts_at || !ends_at) {
    throw new Error("Patient, début et fin sont obligatoires.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("appointments").insert({
    patient_id,
    starts_at,
    ends_at,
    reason: reason || null,
    status: "active",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/appointments");
  revalidatePath(`/patients/${patient_id}/appointments`);
}

export async function updateAppointmentStatusAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");

  if (!id || !status) throw new Error("Paramètres invalides.");

  const supabase = await createClient();
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/appointments");
}

export async function addToWaitingRoomAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const appointment_id = Number(formData.get("appointment_id"));
  const patient_id = Number(formData.get("patient_id"));

  if (!appointment_id || !patient_id) throw new Error("Paramètres invalides.");

  const supabase = await createClient();
  const { error } = await supabase.from("waiting_room_visits").insert({
    appointment_id,
    patient_id,
    status: "waiting",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/waiting-room");
  revalidatePath("/appointments");
}
