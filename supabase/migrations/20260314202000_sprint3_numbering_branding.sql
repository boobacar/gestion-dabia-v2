-- Sprint 3: numbering + clinic profile (branding)

create table if not exists public.clinic_profile (
  id bigserial primary key,
  name text not null default 'Clinique Dentaire Dabia',
  address text,
  phone text,
  email text,
  footer_note text,
  updated_at timestamptz not null default now()
);

insert into public.clinic_profile (name)
select 'Clinique Dentaire Dabia'
where not exists (select 1 from public.clinic_profile);

create unique index if not exists idx_invoices_code_unique on public.invoices(code) where code is not null;
