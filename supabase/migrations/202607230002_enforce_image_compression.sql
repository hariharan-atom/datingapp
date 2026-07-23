-- Enforce the same 150 KiB contract as the client compressor.
-- This migration fails closed for image uploads that bypass the application.

create or replace function public.is_compressed_user_image(
  object_metadata jsonb
)
returns boolean
language sql
immutable
security invoker
set search_path = ''
as $$
  select
    object_metadata ? 'size'
    and lower(coalesce(object_metadata ->> 'mimetype', '')) = 'image/webp'
    and (object_metadata ->> 'size')::bigint <= 153600;
$$;

revoke all on function public.is_compressed_user_image(jsonb) from public;
grant execute on function public.is_compressed_user_image(jsonb)
  to authenticated, service_role;

-- Dedicated image buckets receive a native Storage byte limit as an additional
-- guard. All new application image uploads are normalized to WebP.
update storage.buckets
set
  file_size_limit = 153600,
  allowed_mime_types = array['image/webp']
where id = 'profile-photos';

insert into storage.buckets(
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'user-images',
  'user-images',
  false,
  153600,
  array['image/webp']
)
on conflict(id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "users upload profile photos to own folder"
  on storage.objects;
drop policy if exists "users manage own profile photos"
  on storage.objects;

create policy "users upload compressed profile photos"
on storage.objects for insert
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.is_compressed_user_image(metadata)
);

create policy "users update compressed profile photos"
on storage.objects for update
using (
  bucket_id = 'profile-photos'
  and owner_id = auth.uid()::text
)
with check (
  bucket_id = 'profile-photos'
  and owner_id = auth.uid()::text
  and public.is_compressed_user_image(metadata)
);

-- Chat media also contains voice notes. Images must satisfy the 150 KiB WebP
-- rule; existing non-image media retains its original bucket limit.
drop policy if exists "chat members upload chat media"
  on storage.objects;
drop policy if exists "chat members update chat media"
  on storage.objects;

create policy "chat members upload constrained media"
on storage.objects for insert
with check (
  bucket_id = 'chat-media'
  and exists (
    select 1
    from public.chat_members cm
    where cm.chat_id::text = (storage.foldername(name))[1]
      and cm.user_id = auth.uid()
  )
  and (
    lower(coalesce(metadata ->> 'mimetype', '')) not like 'image/%'
    or public.is_compressed_user_image(metadata)
  )
);

create policy "chat members update constrained media"
on storage.objects for update
using (
  bucket_id = 'chat-media'
  and exists (
    select 1
    from public.chat_members cm
    where cm.chat_id::text = (storage.foldername(name))[1]
      and cm.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'chat-media'
  and exists (
    select 1
    from public.chat_members cm
    where cm.chat_id::text = (storage.foldername(name))[1]
      and cm.user_id = auth.uid()
  )
  and (
    lower(coalesce(metadata ->> 'mimetype', '')) not like 'image/%'
    or public.is_compressed_user_image(metadata)
  )
);

-- Verification storage can contain video. Only image objects are constrained.
drop policy if exists "verification media self"
  on storage.objects;

create policy "verification media read self"
on storage.objects for select
using (
  bucket_id = 'verification'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "verification media insert self"
on storage.objects for insert
with check (
  bucket_id = 'verification'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (
    lower(coalesce(metadata ->> 'mimetype', '')) not like 'image/%'
    or public.is_compressed_user_image(metadata)
  )
);

create policy "verification media update self"
on storage.objects for update
using (
  bucket_id = 'verification'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'verification'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (
    lower(coalesce(metadata ->> 'mimetype', '')) not like 'image/%'
    or public.is_compressed_user_image(metadata)
  )
);

create policy "verification media delete self"
on storage.objects for delete
using (
  bucket_id = 'verification'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Group and report images use a private, owner-scoped bucket. Consumers should
-- receive time-limited signed URLs from a service that checks group/report
-- membership before signing.
create policy "user images read self"
on storage.objects for select
using (
  bucket_id = 'user-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "user images upload compressed self"
on storage.objects for insert
with check (
  bucket_id = 'user-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.is_compressed_user_image(metadata)
);

create policy "user images update compressed self"
on storage.objects for update
using (
  bucket_id = 'user-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'user-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.is_compressed_user_image(metadata)
);

create policy "user images delete self"
on storage.objects for delete
using (
  bucket_id = 'user-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
