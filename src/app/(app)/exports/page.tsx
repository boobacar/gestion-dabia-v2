export default function ExportsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">Exportations</h2>
        <p className="text-sm text-slate-600">Exports CSV opérationnels (patients, rendez-vous, finance).</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <a href="/api/exports/patients" className="rounded-lg border p-4 hover:bg-slate-50">
          <p className="font-medium">Export patients</p>
          <p className="text-sm text-slate-500">CSV des fiches patients.</p>
        </a>

        <a href="/api/exports/appointments" className="rounded-lg border p-4 hover:bg-slate-50">
          <p className="font-medium">Export rendez-vous</p>
          <p className="text-sm text-slate-500">CSV planning et statuts.</p>
        </a>

        <a href="/api/exports/finance" className="rounded-lg border p-4 hover:bg-slate-50">
          <p className="font-medium">Export finance</p>
          <p className="text-sm text-slate-500">CSV factures et paiements.</p>
        </a>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm text-slate-700">
          Étape suivante: générer des PDF métier (devis/facture) avec template clinique Dabia.
        </p>
      </div>
    </div>
  );
}
