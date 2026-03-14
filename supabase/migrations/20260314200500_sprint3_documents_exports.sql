-- Sprint 3: patient documents + export metadata

create type public.document_type as enum ('quote','invoice','prescription','certificate','honorary_note','custom');

create table if not exists public.documents (
  id bigserial primary key,
  patient_id bigint not null references public.patients(id) on delete cascade,
  invoice_id bigint references public.invoices(id) on delete set null,
  title text not null,
  type public.document_type not null default 'custom',
  file_url text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_documents_patient on public.documents(patient_id);

alter table public.documents enable row level security;

create policy "documents_staff_rw" on public.documents
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
