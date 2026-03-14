"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateWaitingRoomStatusAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");

  if (!id || !status) throw new Error("Paramètres invalides.");

  const patch: { status: string; started_at?: string; finished_at?: string } = { status };

  if (status === "in_progress") patch.started_at = new Date().toISOString();
  if (status === "done") patch.finished_at = new Date().toISOString();

  const supabase = await createClient();
  const { error } = await supabase.from("waiting_room_visits").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/waiting-room");
}
