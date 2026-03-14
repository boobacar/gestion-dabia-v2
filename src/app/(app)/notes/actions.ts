"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function retryMessageAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const id = Number(formData.get("id"));
  if (!id) throw new Error("ID invalide.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("message_logs")
    .update({ status: "queued", sent_at: null })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
}

export async function markMessageAsSentAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const id = Number(formData.get("id"));
  if (!id) throw new Error("ID invalide.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("message_logs")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
}
