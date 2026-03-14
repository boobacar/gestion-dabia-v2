"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInventoryProductAction(formData: FormData) {
  if (!hasSupabaseEnv()) throw new Error("Configure Supabase (.env.local).");

  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const unit_price = Number(formData.get("unit_price") || 0);
  const stock_qty = Number(formData.get("stock_qty") || 0);
  const min_stock_qty = Number(formData.get("min_stock_qty") || 0);
  const expires_on = String(formData.get("expires_on") ?? "").trim();

  if (!name) throw new Error("Nom produit obligatoire.");

  const supabase = await createClient();
  const { error } = await supabase.from("inventory_products").insert({
    name,
    sku: sku || null,
    unit: unit || null,
    unit_price: Number.isFinite(unit_price) ? unit_price : 0,
    stock_qty: Number.isFinite(stock_qty) ? stock_qty : 0,
    min_stock_qty: Number.isFinite(min_stock_qty) ? min_stock_qty : 0,
    expires_on: expires_on || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/inventory/products");
}
