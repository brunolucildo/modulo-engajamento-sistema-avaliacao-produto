alter table public.products
  rename column external_link to link;

alter table public.products
  rename column image_url to image;

alter table public.products
  add column price text not null default '';

alter table public.products
  alter column price drop default;

alter table public.products
  drop column description;
