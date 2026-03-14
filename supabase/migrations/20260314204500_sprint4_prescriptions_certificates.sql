-- Sprint 4: prescriptions + medical certificates modules

alter table public.prescriptions
  add column if not exists patient_id bigint references public.patients(id) on delete cascade,
  add column if not exists title text,
  add column if not exists content text,
  add column if not exists practitioner_name text,
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.medical_certificates (
  id bigserial primary key,
  patient_id bigint not null references public.patients(id) on delete cascade,
  title text not null,
  rest_days int,
  content text,
  practitioner_name text,
  issued_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists idx_prescriptions_patient on public.prescriptions(patient_id);
create index if not exists idx_medical_certificates_patient on public.medical_certificates(patient_id);

alter table public.medical_certificates enable row level security;

create policy "medical_certificates_staff_rw" on public.medical_certificates
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
