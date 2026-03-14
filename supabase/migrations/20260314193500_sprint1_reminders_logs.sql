-- Sprint 1: reminders and communication logs

create type public.message_channel as enum ('sms','whatsapp','email');
create type public.message_status as enum ('queued','sent','delivered','failed');

create table if not exists public.notification_settings (
  id bigserial primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  appointment_reminder_enabled boolean not null default true,
  reminder_hours_before int not null default 24,
  preferred_channel public.message_channel not null default 'whatsapp',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id)
);

create table if not exists public.message_logs (
  id bigserial primary key,
  patient_id bigint references public.patients(id) on delete set null,
  appointment_id bigint references public.appointments(id) on delete set null,
  channel public.message_channel not null,
  message text not null,
  status public.message_status not null default 'queued',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notification_settings enable row level security;
alter table public.message_logs enable row level security;

create policy "notification_settings_self_rw" on public.notification_settings
for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "message_logs_staff_rw" on public.message_logs
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
