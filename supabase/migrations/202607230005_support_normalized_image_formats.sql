-- Profile and private user-image buckets accept the normalized formats emitted
-- by supported mobile browsers. The application route verifies file signatures
-- and the 150 KiB maximum before writing with the service role.

update storage.buckets
set
  file_size_limit = 153600,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id in ('profile-photos', 'user-images');
