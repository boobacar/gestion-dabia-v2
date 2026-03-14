"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInventoryPurchaseAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const product_id = Number(formData.get("product_id"));
  const quantity = Number(formData.get("quantity") || 0);
  const unit_cost = Number(formData.get("unit_cost") || 0);
  const supplier = String(formData.get("supplier") ?? "").trim();
  const purchased_on = String(formData.get("purchased_on") ?? "").trim();

  if (!product_id || quantity <= 0) throw new Error("Paramètres invalides.");

  const supabase = await createClient();
  const { error } = await supabase.from("inventory_purchases").insert({
    product_id,
    quantity,
    unit_cost: Number.isFinite(unit_cost) ? unit_cost : 0,
    supplier: supplier || null,
    purchased_on: purchased_on || null,
  });
  if (error) throw new Error(error.message);

  const { data: current } = await supabase
    .from("inventory_products")
    .select("stock_qty")
    .eq("id", product_id)
    .single();

  const stock = Number(current?.stock_qty ?? 0) + quantity;
  await supabase.from("inventory_products").update({ stock_qty: stock }).eq("id", product_id);

  revalidatePath("/inventory/purchases");
  revalidatePath("/inventory/products");
}
