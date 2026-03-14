-- Sprint 5: inventory + prostheses modules

create table if not exists public.inventory_products (
  id bigserial primary key,
  name text not null,
  sku text,
  unit text,
  unit_price numeric(12,2) not null default 0,
  stock_qty numeric(12,2) not null default 0,
  min_stock_qty numeric(12,2) not null default 0,
  expires_on date,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_purchases (
  id bigserial primary key,
  product_id bigint not null references public.inventory_products(id) on delete cascade,
  quantity numeric(12,2) not null,
  unit_cost numeric(12,2) not null default 0,
  supplier text,
  purchased_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.prostheses (
  id bigserial primary key,
  patient_id bigint references public.patients(id) on delete cascade,
  title text,
  lab_name text,
  amount numeric(12,2) not null default 0,
  status text not null default 'ordered',
  due_date date,
  created_at timestamptz not null default now()
);

alter table public.prostheses
  add column if not exists patient_id bigint references public.patients(id) on delete cascade,
  add column if not exists title text,
  add column if not exists lab_name text,
  add column if not exists amount numeric(12,2) not null default 0,
  add column if not exists status text not null default 'ordered',
  add column if not exists due_date date,
  add column if not exists created_at timestamptz not null default now();

create index if not exists idx_inventory_purchases_product on public.inventory_purchases(product_id);
create index if not exists idx_prostheses_patient on public.prostheses(patient_id);

alter table public.inventory_products enable row level security;
alter table public.inventory_purchases enable row level security;
alter table public.prostheses enable row level security;

create policy "inventory_products_staff_rw" on public.inventory_products
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "inventory_purchases_staff_rw" on public.inventory_purchases
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "prostheses_staff_rw" on public.prostheses
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
