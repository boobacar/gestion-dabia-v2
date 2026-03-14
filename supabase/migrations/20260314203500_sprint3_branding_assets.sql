-- Sprint 3 follow-up: clinic branding assets

alter table public.clinic_profile
  add column if not exists logo_url text,
  add column if not exists signature_url text;
