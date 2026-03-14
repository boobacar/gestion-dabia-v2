import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { saveClinicProfileAction } from "./actions";

export default async function SettingsProfilePage() {
  let clinic: {
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    footer_note: string | null;
    logo_url: string | null;
    signature_url: string | null;
  } | null = null;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("clinic_profile")
      .select("name, address, phone, email, footer_note, logo_url, signature_url")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();
    clinic = data;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">Paramètres · Profil clinique</h2>
        <p className="text-sm text-slate-600">Branding utilisé dans les documents imprimables.</p>
      </div>

      <form action={saveClinicProfileAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
        <input name="name" defaultValue={clinic?.name ?? "Clinique Dentaire Dabia"} placeholder="Nom clinique" className="rounded-md border px-3 py-2" />
        <input name="phone" defaultValue={clinic?.phone ?? ""} placeholder="Téléphone" className="rounded-md border px-3 py-2" />
        <input name="email" defaultValue={clinic?.email ?? ""} placeholder="Email" className="rounded-md border px-3 py-2" />
        <input name="address" defaultValue={clinic?.address ?? ""} placeholder="Adresse" className="rounded-md border px-3 py-2" />
        <input name="logo_url" defaultValue={clinic?.logo_url ?? ""} placeholder="URL logo (optionnel)" className="rounded-md border px-3 py-2 md:col-span-2" />
        <input name="signature_url" defaultValue={clinic?.signature_url ?? ""} placeholder="URL signature praticien (optionnel)" className="rounded-md border px-3 py-2 md:col-span-2" />
        <textarea name="footer_note" defaultValue={clinic?.footer_note ?? ""} placeholder="Note de pied de page PDF" className="rounded-md border px-3 py-2 md:col-span-2" rows={3} />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white md:col-span-2">Enregistrer profil clinique</button>
      </form>
    </div>
  );
}
