-- Run this once in the Supabase SQL Editor after creating your app account.
-- Replace the email value with the same address used to sign in to The Atom.

insert into public.shop_admins(user_id)
select id
from auth.users
where lower(email) = lower('YOUR_LOGIN_EMAIL@example.com')
on conflict (user_id) do nothing;

-- Confirm the role was created without exposing other application data.
select
  sa.user_id,
  au.email,
  sa.created_at
from public.shop_admins sa
join auth.users au on au.id = sa.user_id
where lower(au.email) = lower('YOUR_LOGIN_EMAIL@example.com');
