create table if not exists public.products (
  id text primary key,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  score boolean not null default false,
  external_link text not null,
  image_url text not null
);

create index if not exists products_created_at_id_desc_idx
  on public.products (created_at desc, id desc);

alter table public.products enable row level security;
