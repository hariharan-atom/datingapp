-- Admin-managed Shop catalog and customer orders

create type public.shop_order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled'
);

create table public.shop_admins (
  user_id uuid primary key references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.shop_products (
  id text primary key,
  name text not null check (char_length(name) between 2 and 120),
  description text not null check (char_length(description) <= 500),
  category text not null check (category in ('Flowers', 'Food', 'Keepsakes')),
  price_paise integer not null check (price_paise > 0),
  compare_at_price_paise integer check (
    compare_at_price_paise is null or compare_at_price_paise > price_paise
  ),
  image_url text not null,
  badge text,
  rating numeric(2, 1) not null default 5.0 check (rating between 0 and 5),
  stock integer not null default 0 check (stock >= 0),
  sort_order smallint not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references public.users(id) on delete restrict,
  status public.shop_order_status not null default 'confirmed',
  delivery_note text check (char_length(delivery_note) <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shop_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  product_id text not null references public.shop_products(id) on delete restrict,
  quantity smallint not null check (quantity between 1 and 20),
  unit_price_paise integer not null check (unit_price_paise > 0),
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create index shop_products_active_sort_idx
  on public.shop_products(is_active, sort_order);
create index shop_orders_user_created_idx
  on public.shop_orders(user_id, created_at desc);
create index shop_order_items_order_idx
  on public.shop_order_items(order_id);

alter table public.shop_admins enable row level security;
alter table public.shop_products enable row level security;
alter table public.shop_orders enable row level security;
alter table public.shop_order_items enable row level security;

create policy "Admins read their own membership"
  on public.shop_admins for select
  using (user_id = auth.uid());

create policy "Active products are readable"
  on public.shop_products for select
  using (is_active or exists (
    select 1 from public.shop_admins
    where shop_admins.user_id = auth.uid()
  ));

create policy "Admins manage products"
  on public.shop_products for all
  using (exists (
    select 1 from public.shop_admins
    where shop_admins.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.shop_admins
    where shop_admins.user_id = auth.uid()
  ));

create policy "Customers create their own orders"
  on public.shop_orders for insert
  with check (user_id = auth.uid());

create policy "Customers read their own orders"
  on public.shop_orders for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.shop_admins
      where shop_admins.user_id = auth.uid()
    )
  );

create policy "Admins update orders"
  on public.shop_orders for update
  using (exists (
    select 1 from public.shop_admins
    where shop_admins.user_id = auth.uid()
  ));

create policy "Customers add items to their own orders"
  on public.shop_order_items for insert
  with check (exists (
    select 1 from public.shop_orders
    where shop_orders.id = order_id
      and shop_orders.user_id = auth.uid()
  ));

create policy "Customers read their own order items"
  on public.shop_order_items for select
  using (exists (
    select 1 from public.shop_orders
    where shop_orders.id = order_id
      and (
        shop_orders.user_id = auth.uid()
        or exists (
          select 1 from public.shop_admins
          where shop_admins.user_id = auth.uid()
        )
      )
  ));

insert into public.shop_products (
  id,
  name,
  description,
  category,
  price_paise,
  compare_at_price_paise,
  image_url,
  badge,
  rating,
  stock,
  sort_order
) values
  (
    'blue-bloom-bouquet',
    'Blue Bloom Bouquet',
    'Fresh white and powder-blue flowers, wrapped by hand.',
    'Flowers',
    149900,
    179900,
    '/images/shop/blue-bloom-bouquet.webp',
    'Bestseller',
    4.9,
    18,
    10
  ),
  (
    'coffee-date-kit',
    'Coffee Date Kit',
    'Artisan coffee, two ceramic cups, and cookies for two.',
    'Food',
    129900,
    null,
    '/images/shop/coffee-date-kit.webp',
    'Date night',
    4.8,
    24,
    20
  ),
  (
    'midnight-chocolate-box',
    'Midnight Chocolate Box',
    'A generous selection of handcrafted milk and dark chocolates.',
    'Food',
    89900,
    109900,
    '/images/shop/midnight-chocolate-box.webp',
    null,
    4.9,
    32,
    30
  ),
  (
    'together-journal',
    'Together Journal',
    'A linen-bound journal for memories, plans, and little notes.',
    'Keepsakes',
    69900,
    null,
    '/images/shop/together-journal.webp',
    'New',
    4.7,
    16,
    40
  ),
  (
    'celebration-cake',
    'Celebration Cake for Two',
    'A small vanilla cake with blue ombré buttercream.',
    'Food',
    79900,
    null,
    '/images/shop/celebration-cake.webp',
    'Same day',
    4.8,
    10,
    50
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  price_paise = excluded.price_paise,
  compare_at_price_paise = excluded.compare_at_price_paise,
  image_url = excluded.image_url,
  badge = excluded.badge,
  rating = excluded.rating,
  stock = excluded.stock,
  sort_order = excluded.sort_order,
  updated_at = now();

create or replace function public.place_shop_order(
  order_lines jsonb,
  note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_order_id uuid;
  line record;
  product_price integer;
  available_stock integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if order_lines is null
    or jsonb_typeof(order_lines) <> 'array'
    or jsonb_array_length(order_lines) = 0
    or jsonb_array_length(order_lines) > 20
  then
    raise exception 'Order must contain between 1 and 20 products';
  end if;

  insert into public.shop_orders(user_id, delivery_note)
  values(auth.uid(), nullif(trim(note), ''))
  returning id into new_order_id;

  for line in
    select *
    from jsonb_to_recordset(order_lines)
      as requested(product_id text, quantity integer)
  loop
    if line.quantity is null or line.quantity < 1 or line.quantity > 20 then
      raise exception 'Invalid product quantity';
    end if;

    select price_paise, stock
    into product_price, available_stock
    from public.shop_products
    where id = line.product_id and is_active
    for update;

    if product_price is null then
      raise exception 'A product is unavailable';
    end if;

    if available_stock < line.quantity then
      raise exception 'Not enough stock for product %', line.product_id;
    end if;

    insert into public.shop_order_items(
      order_id,
      product_id,
      quantity,
      unit_price_paise
    )
    values(new_order_id, line.product_id, line.quantity, product_price);

    update public.shop_products
    set stock = stock - line.quantity,
        updated_at = now()
    where id = line.product_id;
  end loop;

  return new_order_id;
end;
$$;

revoke all on function public.place_shop_order(jsonb, text) from public;
grant execute on function public.place_shop_order(jsonb, text) to authenticated;
