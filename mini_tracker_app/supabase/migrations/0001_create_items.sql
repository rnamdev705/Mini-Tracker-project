-- Mini Tracker schema
-- Run in Supabase SQL editor or as a migration.

create extension if not exists pgcrypto;

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  amount numeric not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.items
  add constraint items_status_check check (status in ('pending', 'done'));

create or replace function public.set_items_user_id()
returns trigger
language plpgsql
security definer
as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_items_set_user_id on public.items;
create trigger trg_items_set_user_id
before insert on public.items
for each row execute function public.set_items_user_id();

drop trigger if exists trg_items_set_user_id_update on public.items;
create trigger trg_items_set_user_id_update
before update on public.items
for each row execute function public.set_items_user_id();

alter table public.items enable row level security;

-- RLS: users can only access their own rows
drop policy if exists "items_select_own" on public.items;
create policy "items_select_own"
on public.items
for select
using (user_id = auth.uid());

drop policy if exists "items_insert_own" on public.items;
create policy "items_insert_own"
on public.items
for insert
with check (user_id = auth.uid());

drop policy if exists "items_update_own" on public.items;
create policy "items_update_own"
on public.items
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "items_delete_own" on public.items;
create policy "items_delete_own"
on public.items
for delete
using (user_id = auth.uid());

create index if not exists items_user_id_created_at_idx
on public.items (user_id, created_at desc);

