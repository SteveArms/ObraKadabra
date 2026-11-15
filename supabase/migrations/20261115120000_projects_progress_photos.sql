-- Projects, progress logs and photos of each owner; anonymous sessions count as owners too (role authenticated)
-- Safe to run again: every object is created only when missing and every policy is replaced

create table if not exists public.projects (
  id text primary key,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  location text,
  start_date date,
  status text check (status in ('draft', 'ready')),
  floor_plan jsonb not null,
  share_token text unique check (share_token is null or length(share_token) >= 16),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_owner_updated_idx on public.projects (owner_id, updated_at desc);

-- No foreign key to projects: demos live in the app code, and their owners can still log progress on them
create table if not exists public.progress_entries (
  id text primary key,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id text not null,
  week integer not null check (week >= 1),
  level_label text not null,
  sector text,
  recorded_at timestamptz not null,
  approved boolean not null default false,
  has_photo boolean not null default false,
  findings jsonb not null default '[]'::jsonb
);
create index if not exists progress_entries_owner_project_idx on public.progress_entries (owner_id, project_id, recorded_at desc);

-- One row per file in the photos bucket: plan sheets (one per level) and site photos (one per progress entry)
create table if not exists public.photos (
  path text primary key,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id text,
  kind text not null check (kind in ('plan', 'progress')),
  level integer,
  entry_id text,
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  check ((kind = 'plan' and project_id is not null and level is not null) or (kind = 'progress' and entry_id is not null))
);
create index if not exists photos_entry_idx on public.photos (entry_id);

alter table public.projects enable row level security;
alter table public.progress_entries enable row level security;
alter table public.photos enable row level security;

drop policy if exists "owners manage their projects" on public.projects;
create policy "owners manage their projects" on public.projects for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists "owners manage their progress" on public.progress_entries;
create policy "owners manage their progress" on public.progress_entries for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists "owners manage their photos" on public.photos;
create policy "owners manage their photos" on public.photos for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

-- The only public read: whoever holds the share token sees the project, its approved logs and the latest approved photo
create or replace function public.get_shared_project(token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'project', to_jsonb(p) - 'owner_id' - 'share_token',
    'progress', coalesce((
      select jsonb_agg(to_jsonb(e) - 'owner_id' order by e.recorded_at desc)
      from public.progress_entries e
      where e.project_id = p.id and e.owner_id = p.owner_id and e.approved
    ), '[]'::jsonb),
    'photo_path', (
      select ph.path
      from public.photos ph
      join public.progress_entries e on e.id = ph.entry_id and e.owner_id = ph.owner_id
      where ph.kind = 'progress' and e.project_id = p.id and e.owner_id = p.owner_id and e.approved
      order by e.recorded_at desc
      limit 1
    )
  )
  from public.projects p
  where p.share_token = token;
$$;
revoke execute on function public.get_shared_project(text) from public;
grant execute on function public.get_shared_project(text) to anon, authenticated;

-- Newer projects no longer expose new tables to the Data API by default; row level security still limits each row to its owner
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.projects, public.progress_entries, public.photos to authenticated, service_role;

-- Private bucket: each owner reads and writes only inside the folder named after their user id
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "owners read their photos" on storage.objects;
create policy "owners read their photos" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "owners upload their photos" on storage.objects;
create policy "owners upload their photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "owners replace their photos" on storage.objects;
create policy "owners replace their photos" on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "owners delete their photos" on storage.objects;
create policy "owners delete their photos" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

notify pgrst, 'reload schema';
