insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submission-artifacts',
  'submission-artifacts',
  false,
  5242880,
  array['application/pdf', 'image/jpeg', 'image/png']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
