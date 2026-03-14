export function PagePlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <section className="space-y-2">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-sm text-slate-600">{description ?? "Module prêt pour implémentation."}</p>
    </section>
  );
}
