-- Products tablosu
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  quantity decimal not null,
  unit text not null,
  safety_period integer not null,
  active_ingredient text not null,
  dosage_per_hundred_lt decimal not null,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Usage records tablosu
create table usage_records (
  id uuid primary key default gen_random_uuid(),
  date timestamp with time zone not null,
  total_water_amount decimal not null
);

-- Usage products tablosu (ilaç kullanım detayları için)
create table usage_products (
  id uuid primary key default gen_random_uuid(),
  usage_record_id uuid references usage_records(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  calculated_usage decimal not null
);

-- Row Level Security politikaları
alter table products enable row level security;
alter table usage_records enable row level security;
alter table usage_products enable row level security;

-- Herkesin okuma/yazma yapabilmesi için politikalar
create policy "Enable read access for all users" on products for select using (true);
create policy "Enable insert access for all users" on products for insert with check (true);
create policy "Enable update access for all users" on products for update using (true);
create policy "Enable delete access for all users" on products for delete using (true);

create policy "Enable read access for all users" on usage_records for select using (true);
create policy "Enable insert access for all users" on usage_records for insert with check (true);
create policy "Enable update access for all users" on usage_records for update using (true);
create policy "Enable delete access for all users" on usage_records for delete using (true);

create policy "Enable read access for all users" on usage_products for select using (true);
create policy "Enable insert access for all users" on usage_products for insert with check (true);
create policy "Enable update access for all users" on usage_products for update using (true);
create policy "Enable delete access for all users" on usage_products for delete using (true);