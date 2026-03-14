-- Sprint 1: appointments + waiting room enhancements

create type public.waiting_room_status as enum ('waiting','in_progress','done','cancelled');

create table if not exists public.waiting_room_visits (
  id bigserial primary key,
  patient_id bigint not null references public.patients(id) on delete cascade,
  practitioner_id bigint references public.practitioners(id),
  appointment_id bigint references public.appointments(id) on delete set null,
  reason text,
  status public.waiting_room_status not null default 'waiting',
  arrived_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_appointments_starts_at on public.appointments(starts_at);
create index if not exists idx_appointments_status on public.appointments(status);
create index if not exists idx_waiting_room_status on public.waiting_room_visits(status);

alter table public.waiting_room_visits enable row level security;

create policy "waiting_room_staff_rw" on public.waiting_room_visits
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
