-- ═════════════════════════════════════════════════════════════════════════════
-- RESQ Platform · Supabase Database Schema, Triggers, RPCs & RLS Policies
-- ═════════════════════════════════════════════════════════════════════════════
-- Run this entire script in your Supabase Dashboard → SQL Editor → New query.
-- Sets up interconnected tables across Citizen, Authority, and Admin interfaces:
--   1. public.profiles          (User accounts & RBAC roles)
--   2. public.facilities        (Shelters, Hospitals, Blood Banks, Relief Hubs)
--   3. public.incidents         (Citizen reports + photos + Authority verification)
--   4. public.sos_beacons       (Citizen SOS beacons + Authority triage/dispatch)
--   5. public.alerts            (Authority multilingual EAS broadcasts → Citizens)
--   6. public.resources         (Admin Multi-Org network inventory & deployments)
--   7. public.resource_requests (Authority → Admin logistics match requests)
--   8. public.platform_state    (Shared Closed-Loop Lifecycle stage sync)
-- ═════════════════════════════════════════════════════════════════════════════

-- ── 1. PROFILES TABLE ────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  display_name text,
  avatar_url text,
  role text not null default 'citizen' check (role in ('citizen', 'authority', 'admin')),
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now(),
  role_updated_at timestamptz
);

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'citizen'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, display_name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    'citizen'
  )
  on conflict (id) do update set
    email         = coalesce(excluded.email, public.profiles.email),
    phone         = coalesce(excluded.phone, public.profiles.phone),
    display_name  = coalesce(excluded.display_name, public.profiles.display_name),
    avatar_url    = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    last_login_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.prevent_self_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if auth.uid() is not null and public.current_user_role() <> 'admin' then
      raise exception 'Only administrators can change user roles.';
    end if;
    new.role_updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.prevent_self_role_escalation();

create or replace function public.set_user_role(target_user_id uuid, new_role text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if public.current_user_role() <> 'admin' then
    raise exception 'Only administrators can assign user roles.';
  end if;

  if new_role not in ('citizen', 'authority', 'admin') then
    raise exception 'Invalid role: %. Must be citizen, authority, or admin.', new_role;
  end if;

  if target_user_id = auth.uid() and new_role <> 'admin' then
    raise exception 'Cannot demote your own admin account. Ask another admin.';
  end if;

  update public.profiles
  set role = new_role,
      role_updated_at = now()
  where id = target_user_id;

  if not found then
    raise exception 'Target user profile not found.';
  end if;

  return jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'role', new_role
  );
end;
$$;

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile or authority/admin can view all" on public.profiles;
create policy "Users can view own profile or authority/admin can view all"
  on public.profiles for select
  using (auth.uid() = id or public.current_user_role() in ('authority', 'admin'));

drop policy if exists "Users can insert own citizen profile" on public.profiles;
create policy "Users can insert own citizen profile"
  on public.profiles for insert
  with check (auth.uid() = id and role = 'citizen');

drop policy if exists "Users can update own profile or admin can update any" on public.profiles;
create policy "Users can update own profile or admin can update any"
  on public.profiles for update
  using (auth.uid() = id or public.current_user_role() = 'admin')
  with check (auth.uid() = id or public.current_user_role() = 'admin');

drop policy if exists "Only admins can delete profiles" on public.profiles;
create policy "Only admins can delete profiles"
  on public.profiles for delete
  using (public.current_user_role() = 'admin');


-- ── 2. FACILITIES TABLE ──────────────────────────────────────────────────────
create table if not exists public.facilities (
  id text primary key,
  name text not null,
  type text not null check (type in ('SHELTER', 'HOSPITAL', 'RELIEF_STATION', 'BLOOD_BANK')),
  address text not null,
  distance_km double precision not null default 1.0,
  drive_time_min integer not null default 5,
  walk_time_min integer not null default 15,
  lat double precision not null,
  lng double precision not null,
  status text not null default 'OPEN' check (status in ('OPEN', 'NEAR_CAPACITY', 'FULL', 'CLOSED')),
  capacity_total integer not null default 100,
  capacity_used integer not null default 0,
  phone text not null,
  blood_stock jsonb,
  features jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.facilities enable row level security;

drop policy if exists "Authenticated users can read facilities" on public.facilities;
create policy "Authenticated users can read facilities"
  on public.facilities for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admins can manage facilities" on public.facilities;
create policy "Admins can manage facilities"
  on public.facilities for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');


-- ── 3. INCIDENTS TABLE ───────────────────────────────────────────────────────
create table if not exists public.incidents (
  id text primary key,
  title text not null,
  category text not null,
  severity text not null check (severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  location_name text not null,
  lat double precision not null,
  lng double precision not null,
  distance_km double precision not null default 0.8,
  reported_at_label text not null default 'Just now',
  reported_by text not null,
  reported_by_uid uuid references auth.users(id) on delete set null,
  is_verified boolean not null default false,
  upvotes integer not null default 1,
  description text not null,
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED', 'VERIFIED', 'RESPONDING', 'RESOLVED')),
  photo_url text,
  ai_verification_score integer,
  created_at timestamptz not null default now()
);

create or replace function public.upvote_incident(target_incident_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  update public.incidents
  set upvotes = upvotes + 1
  where id = target_incident_id
  returning upvotes into new_count;

  return coalesce(new_count, 0);
end;
$$;

alter table public.incidents enable row level security;

drop policy if exists "Authenticated users can read incidents" on public.incidents;
create policy "Authenticated users can read incidents"
  on public.incidents for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can report incidents" on public.incidents;
create policy "Authenticated users can report incidents"
  on public.incidents for insert
  with check (auth.uid() is not null and (reported_by_uid is null or reported_by_uid = auth.uid()));

drop policy if exists "Authority and admin can update incidents" on public.incidents;
create policy "Authority and admin can update incidents"
  on public.incidents for update
  using (public.current_user_role() in ('authority', 'admin'))
  with check (public.current_user_role() in ('authority', 'admin'));

drop policy if exists "Only admins can delete incidents" on public.incidents;
create policy "Only admins can delete incidents"
  on public.incidents for delete
  using (public.current_user_role() = 'admin');


-- ── 4. SOS BEACONS TABLE ─────────────────────────────────────────────────────
create table if not exists public.sos_beacons (
  id uuid primary key default gen_random_uuid(),
  beacon_code text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  caller_name text,
  emergency_type text not null,
  location_name text default 'Current GPS Fix',
  lat double precision not null,
  lng double precision not null,
  blood_type text,
  medical_notes text,
  people_count integer not null default 1,
  contacts_notified_count integer not null default 3,
  workflow_stage text not null default 'BROADCASTED' check (workflow_stage in ('BROADCASTED', 'DISPATCHED', 'IN_TRANSIT', 'ON_SCENE')),
  assigned_unit text default 'Pending EOC Triage',
  eta_minutes integer default 8,
  is_active boolean not null default true,
  started_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.sos_beacons enable row level security;

drop policy if exists "Users can view own SOS or authority/admin can view all" on public.sos_beacons;
create policy "Users can view own SOS or authority/admin can view all"
  on public.sos_beacons for select
  using (user_id = auth.uid() or public.current_user_role() in ('authority', 'admin'));

drop policy if exists "Authenticated users can create own SOS" on public.sos_beacons;
create policy "Authenticated users can create own SOS"
  on public.sos_beacons for insert
  with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "Owner or authority/admin can update SOS" on public.sos_beacons;
create policy "Owner or authority/admin can update SOS"
  on public.sos_beacons for update
  using (user_id = auth.uid() or public.current_user_role() in ('authority', 'admin'))
  with check (user_id = auth.uid() or public.current_user_role() in ('authority', 'admin'));

drop policy if exists "Only admins can delete SOS" on public.sos_beacons;
create policy "Only admins can delete SOS"
  on public.sos_beacons for delete
  using (public.current_user_role() = 'admin');


-- ── 5. ALERTS TABLE ──────────────────────────────────────────────────────────
create table if not exists public.alerts (
  id text primary key,
  headline text not null,
  severity text not null check (severity in ('CRITICAL', 'WARNING', 'WATCH', 'ADVISORY')),
  category text not null,
  issued_at_label text not null default 'Just now',
  expires_at_label text not null default 'In 6 hours',
  affected_radius_km integer not null default 20,
  source_authority text not null,
  summary text not null,
  instructions jsonb not null default '{"do":[],"dont":[]}'::jsonb,
  audio_warning_available boolean not null default true,
  translations jsonb,
  created_at timestamptz not null default now()
);

alter table public.alerts enable row level security;

drop policy if exists "Authenticated users can read alerts" on public.alerts;
create policy "Authenticated users can read alerts"
  on public.alerts for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authority and admin can manage alerts" on public.alerts;
create policy "Authority and admin can manage alerts"
  on public.alerts for all
  using (public.current_user_role() in ('authority', 'admin'))
  with check (public.current_user_role() in ('authority', 'admin'));


-- ── 6. RESOURCES TABLE ───────────────────────────────────────────────────────
create table if not exists public.resources (
  id text primary key,
  org_name text not null,
  org_type text not null check (org_type in ('AUTHORITY', 'HOSPITAL', 'NGO', 'SUPPLIER')),
  resource_category text not null,
  available_qty text not null,
  assigned_to_sector text not null,
  status text not null default 'AVAILABLE' check (status in ('AVAILABLE', 'EN_ROUTE', 'DEPLOYED')),
  updated_at timestamptz not null default now()
);

alter table public.resources enable row level security;

drop policy if exists "Authenticated users can read resources" on public.resources;
create policy "Authenticated users can read resources"
  on public.resources for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authority and admin can manage resources" on public.resources;
create policy "Authority and admin can manage resources"
  on public.resources for all
  using (public.current_user_role() in ('authority', 'admin'))
  with check (public.current_user_role() in ('authority', 'admin'));


-- ── 7. RESOURCE REQUESTS TABLE (Authority → Admin Cross-Org Bridge) ──────────
create table if not exists public.resource_requests (
  id text primary key,
  requested_by text not null,
  sector text not null,
  resource_category text not null,
  needed_qty text not null,
  urgency text not null default 'HIGH' check (urgency in ('CRITICAL', 'HIGH', 'MEDIUM')),
  notes text,
  status text not null default 'OPEN' check (status in ('OPEN', 'MATCHED', 'FULFILLED')),
  matched_resource_id text,
  matched_org_name text,
  created_at timestamptz not null default now()
);

alter table public.resource_requests enable row level security;

drop policy if exists "Authenticated users can read resource_requests" on public.resource_requests;
create policy "Authenticated users can read resource_requests"
  on public.resource_requests for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authority and admin can manage resource_requests" on public.resource_requests;
create policy "Authority and admin can manage resource_requests"
  on public.resource_requests for all
  using (public.current_user_role() in ('authority', 'admin'))
  with check (public.current_user_role() in ('authority', 'admin'));


-- ── 8. PLATFORM STATE TABLE (Lifecycle Stage Sync) ───────────────────────────
create table if not exists public.platform_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.platform_state enable row level security;

drop policy if exists "Authenticated users can read platform_state" on public.platform_state;
create policy "Authenticated users can read platform_state"
  on public.platform_state for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authority and admin can update platform_state" on public.platform_state;
create policy "Authority and admin can update platform_state"
  on public.platform_state for all
  using (public.current_user_role() in ('authority', 'admin'))
  with check (public.current_user_role() in ('authority', 'admin'));


-- ── 9. SEED INITIAL DATA (idempotent) ────────────────────────────────────────
insert into public.facilities (id, name, type, address, distance_km, drive_time_min, walk_time_min, lat, lng, status, capacity_total, capacity_used, phone, blood_stock, features)
values
  ('fac-1', 'Civic Center Evacuation Complex', 'SHELTER', '420 Harbor Blvd, Sector 3', 1.4, 6, 18, 18.9280, 72.8390, 'OPEN', 650, 390, '+1 (555) 432-8801', null, '{"backupGenerator":true,"cleanWater":true,"medicalStaff":true,"petFriendly":true,"wheelchairAccessible":true,"foodDaysStock":5}'::jsonb),
  ('fac-2', 'Metro Memorial Hospital & Trauma Center', 'HOSPITAL', '88 Healthcare Parkway, District Medical Hub', 2.1, 8, 26, 18.9180, 72.8290, 'NEAR_CAPACITY', 340, 298, '+1 (555) 890-3322', null, '{"backupGenerator":true,"cleanWater":true,"medicalStaff":true,"petFriendly":false,"wheelchairAccessible":true,"pediatricCare":true,"traumaCare":true,"foodDaysStock":7}'::jsonb),
  ('fac-bb-1', 'Central Red Cross Blood Bank & Plasma Reserve', 'BLOOD_BANK', '102 Medical Enclave, Sector 4', 2.4, 9, 28, 18.9215, 72.8315, 'OPEN', 500, 380, '+1 (555) 234-5500', '{"O+":42,"O-":8,"A+":36,"B+":29,"AB+":14}'::jsonb, '{"backupGenerator":true,"cleanWater":true,"medicalStaff":true,"petFriendly":false,"wheelchairAccessible":true,"foodDaysStock":4}'::jsonb),
  ('fac-3', 'St. Jude Community High School Shelter', 'SHELTER', '150 Pinecrest Avenue', 3.2, 12, 40, 18.9350, 72.8420, 'OPEN', 420, 160, '+1 (555) 330-1120', null, '{"backupGenerator":true,"cleanWater":true,"medicalStaff":false,"petFriendly":true,"wheelchairAccessible":true,"foodDaysStock":4}'::jsonb),
  ('fac-4', 'Coastline Regional General Hospital', 'HOSPITAL', '210 Oceanway Drive', 4.6, 15, 58, 18.9110, 72.8220, 'OPEN', 280, 195, '+1 (555) 991-4477', null, '{"backupGenerator":true,"cleanWater":true,"medicalStaff":true,"petFriendly":false,"wheelchairAccessible":true,"traumaCare":true,"pediatricCare":true,"foodDaysStock":6}'::jsonb),
  ('fac-bb-2', 'Apollo Lifeline Regional Blood Bank', 'BLOOD_BANK', '45 Emergency Cross, Avenue 9', 3.8, 13, 44, 18.9150, 72.8250, 'NEAR_CAPACITY', 300, 275, '+1 (555) 980-2211', '{"O+":18,"O-":2,"A+":22,"B+":16,"AB+":7}'::jsonb, '{"backupGenerator":true,"cleanWater":true,"medicalStaff":true,"petFriendly":false,"wheelchairAccessible":true,"foodDaysStock":5}'::jsonb),
  ('fac-5', 'Red Cross Relief & Clean Water Distribution Hub', 'RELIEF_STATION', 'Gate 4, Municipal Logistics Terminal', 2.8, 9, 34, 18.9240, 72.8480, 'OPEN', 1200, 420, '+1 (555) 774-2900', null, '{"backupGenerator":true,"cleanWater":true,"medicalStaff":true,"petFriendly":true,"wheelchairAccessible":true,"foodDaysStock":10}'::jsonb)
on conflict (id) do nothing;

insert into public.incidents (id, title, category, severity, location_name, lat, lng, distance_km, reported_at_label, reported_by, is_verified, upvotes, status, ai_verification_score, description)
values
  ('inc-101', 'Severe Underpass Submersion & Stalled Vehicle', 'FLOODING', 'HIGH', '4th Avenue Railway Underpass, Sector 2', 18.9250, 72.8360, 0.9, '14 mins ago', 'Civil Defense Volunteer #41', true, 28, 'VERIFIED', 94, 'Water depth exceeds 0.9 meters. A minivan is stranded mid-passage. Municipal pumps arriving; entire road section closed.'),
  ('inc-102', 'High-Voltage Power Pole Uprooted & Live Cable', 'HAZARD', 'CRITICAL', 'Corner of Bayview St and 11th Cross', 18.9210, 72.8320, 1.2, '28 mins ago', 'Resident Council Lead', true, 45, 'RESPONDING', 98, 'Transformer line sparking on asphalt. Traffic blocked both ways. Grid operators informed to de-energize sub-circuit 3B.'),
  ('inc-103', 'Hillside Mudslide & Debris Blocking Evacuation Lane', 'LANDSLIDE', 'HIGH', 'Ghat Pass Mile 12, Upper Ridge Highway', 18.9195, 72.8305, 1.8, '36 mins ago', 'Transport Scout #9', true, 31, 'VERIFIED', 92, 'Roughly 40 tons of wet soil and boulders have collapsed across northbound lane. Bulldozer crew en route. Use South bypass.'),
  ('inc-104', 'Fallen Banyan Tree Blocking Ambulance Access', 'ROAD_BLOCK', 'MEDIUM', 'Oak Ridge Lane approaching Metro Hospital', 18.9195, 72.8305, 1.8, '42 mins ago', 'Paramedic Crew 7', true, 19, 'RESPONDING', 89, 'Chainsaw teams deployed. Detour active through University Boulevard side route.')
on conflict (id) do nothing;

insert into public.resources (id, org_name, org_type, resource_category, available_qty, assigned_to_sector, status)
values
  ('res-1', 'National Disaster Response Force (NDRF)', 'AUTHORITY', 'HEAVY_EQUIPMENT', '12 Inflatable Zodiac Boats + 4 Excavators', 'Sector 2 Floodplain Core', 'DEPLOYED'),
  ('res-2', 'International Red Cross Committee', 'NGO', 'DRINKING_WATER', '25,000 Liters Potable Water Packs', 'Zone 4 Coastal Basin', 'EN_ROUTE'),
  ('res-3', 'Metro Memorial Hospital Blood Center', 'HOSPITAL', 'TRAUMA_KITS', '140 Advanced Trauma Packs + 80 Blood Units', 'District Trauma Center Hub', 'AVAILABLE'),
  ('res-4', 'Goonj Relief Disaster Logistics', 'NGO', 'BLANKETS_COTS', '1,800 Thermal Blankets & Foldable Cots', 'Civic Center Shelter', 'DEPLOYED'),
  ('res-5', 'Apex Food Processing & Wholesale Logistics', 'SUPPLIER', 'FOOD_RATIONS', '12,000 High-Calorie Dry Meal Kits', 'Central Warehouse Hub', 'AVAILABLE')
on conflict (id) do nothing;

insert into public.resource_requests (id, requested_by, sector, resource_category, needed_qty, urgency, notes, status)
values
  ('req-1', 'EOC Sector 2 Incident Lead', 'Sector 2 - Floodplain Core', 'DRINKING_WATER', '5,000 Liters + Chlorine Tablets', 'CRITICAL', 'Stormwater pumps active; shelters running low on potable reserves.', 'OPEN')
on conflict (id) do nothing;

insert into public.platform_state (key, value)
values ('active_lifecycle_stage', '"RESPOND"'::jsonb)
on conflict (key) do nothing;

-- ── 10. ENABLE REALTIME FOR LIVE INTERCONNECTED DASHBOARDS ───────────────────
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.incidents; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.facilities; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.sos_beacons; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.alerts; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.resources; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.resource_requests; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.platform_state; exception when duplicate_object then null; end;
  end if;
end $$;
