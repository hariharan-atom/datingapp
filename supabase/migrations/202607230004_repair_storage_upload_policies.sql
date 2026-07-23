-- Supabase Storage owns its object metadata transaction. Calling a custom
-- public-schema function against storage.objects.metadata from an INSERT RLS
-- policy can make the Storage API reject otherwise valid uploads as an
-- incompatible schema. Keep authorization in RLS and enforce image size/type
-- through the native bucket limits instead.

update storage.buckets
set
  file_size_limit = 153600,
  allowed_mime_types = array['image/webp']
where id in ('profile-photos', 'user-images');

drop policy if exists "users upload compressed profile photos"
  on storage.objects;
drop policy if exists "users update compressed profile photos"
  on storage.objects;

create policy "users upload profile photos to own folder"
on storage.objects for insert
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users update profile photos in own folder"
on storage.objects for update
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "chat members upload constrained media"
  on storage.objects;
drop policy if exists "chat members update constrained media"
  on storage.objects;

drop policy if exists "verification media insert self"
  on storage.objects;
drop policy if exists "verification media update self"
  on storage.objects;

-- chat-media and verification are mixed-media buckets, so a bucket-wide byte
-- limit cannot enforce the image-only rule. Their authenticated INSERT/UPDATE
-- policies intentionally remain absent: the application upload route validates
-- image bytes and membership, then writes with the server-only service role.

drop policy if exists "user images upload compressed self"
  on storage.objects;
drop policy if exists "user images update compressed self"
  on storage.objects;

create policy "user images upload self"
on storage.objects for insert
with check (
  bucket_id = 'user-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "user images update self"
on storage.objects for update
using (
  bucket_id = 'user-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'user-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop function if exists public.is_compressed_user_image(jsonb);
