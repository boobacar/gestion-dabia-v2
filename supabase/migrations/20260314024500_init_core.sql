-- Gestion Dabia v2 - initial core schema

create extension if not exists "uuid-ossp";

create type public.user_role as enum ('admin','dentist','secretary','assistant');
create type public.appointment_status as enum ('active','finished','absence','cancelled_by_patient','cancelled_by_practitioner');
create type public.online_appointment_status as enum ('pending','validated','untreated','unvalidated','absence','draft');

create table if not exists public.profiles (
  id uuid primary key,
  full_name text,
  role public.user_role not null default 'assistant',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patients (
  id bigserial primary key,
  first_name text not null,
  last_name text not null,
  phone text,
  email text,
  gender text,
  birth_date date,
  city text,
  address text,
  insurance_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.practitioners (
  id bigserial primary key,
  full_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id bigserial primary key,
  patient_id bigint not null references public.patients(id) on delete cascade,
  practitioner_id bigint references public.practitioners(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'active',
  reason text,
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.online_appointments (
  id bigserial primary key,
  patient_name text not null,
  phone text,
  email text,
  requested_at timestamptz,
  practitioner_id bigint references public.practitioners(id),
  status public.online_appointment_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.clinical_procedures (
  id bigserial primary key,
  patient_id bigint not null references public.patients(id) on delete cascade,
  practitioner_id bigint references public.practitioners(id),
  procedure_name text not null,
  tooth_code text,
  amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  status text not null default 'en_attente',
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id bigserial primary key,
  patient_id bigint not null references public.patients(id) on delete cascade,
  code text,
  amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id bigserial primary key,
  patient_id bigint not null references public.patients(id) on delete cascade,
  invoice_id bigint references public.invoices(id) on delete set null,
  amount numeric(12,2) not null,
  method text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id bigserial primary key,
  patient_id bigint references public.patients(id) on delete cascade,
  title text not null,
  content text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- RLS baseline
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.online_appointments enable row level security;
alter table public.clinical_procedures enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.notes enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

create policy "profiles_self_read" on public.profiles for select using (id = auth.uid());
create policy "patients_staff_rw" on public.patients for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "appointments_staff_rw" on public.appointments for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "online_appointments_staff_rw" on public.online_appointments for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "clinical_procedures_staff_rw" on public.clinical_procedures for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "invoices_staff_rw" on public.invoices for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "payments_staff_rw" on public.payments for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "notes_staff_rw" on public.notes for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
