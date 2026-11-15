-- Newer projects no longer expose new tables to the Data API by default; row level security still limits each row to its owner
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.projects, public.progress_entries, public.photos to authenticated, service_role;
-- anon gets no table access: visitors of a share link only call get_shared_project
