-- Sprint 2: treatment plans + invoices improvements

create table if not exists public.treatment_plans (
  id bigserial primary key,
  patient_id bigint not null references public.patients(id) on delete cascade,
  title text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.treatment_plan_items (
  id bigserial primary key,
  treatment_plan_id bigint not null references public.treatment_plans(id) on delete cascade,
  procedure_id bigint references public.clinical_procedures(id) on delete set null,
  label text not null,
  amount numeric(12,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.clinical_procedures
  add column if not exists treatment_plan_id bigint references public.treatment_plans(id) on delete set null;

alter table public.invoices
  add column if not exists patient_id bigint references public.patients(id) on delete cascade,
  add column if not exists due_date date,
  add column if not exists note text;

create index if not exists idx_treatment_plans_patient on public.treatment_plans(patient_id);
create index if not exists idx_treatment_plan_items_plan on public.treatment_plan_items(treatment_plan_id);

alter table public.treatment_plans enable row level security;
alter table public.treatment_plan_items enable row level security;

create policy "treatment_plans_staff_rw" on public.treatment_plans
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "treatment_plan_items_staff_rw" on public.treatment_plan_items
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
