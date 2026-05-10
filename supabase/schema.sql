-- Rett:ich database schema
-- Diese Datei einmalig im Supabase SQL Editor ausführen.
-- Sie ist idempotent: Mehrfaches Ausführen schadet nichts.

-- =============================================================================
-- Helper: prüft, ob der aktuell eingeloggte User Admin ist
-- (Admin-Status wird per Supabase-Dashboard im app_metadata gesetzt:
--  raw_app_meta_data = { "role": "admin" })
-- =============================================================================
create or replace function is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- =============================================================================
-- Tabelle: recipes (zentraler, geteilter Pool)
-- Read: alle eingeloggten User
-- Write: nur Admins
-- =============================================================================
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  time_minutes int not null,
  portions int default 1,
  chopping text check (chopping in ('none', 'basic', 'lots')) default 'none',
  uses_stove boolean default false,
  uses_oven boolean default false,
  requires_multitasking boolean default false,
  ingredient_count int default 0,
  pan_count int default 1,
  can_walk_away boolean default false,
  tags text[] default '{}',
  ingredients jsonb not null default '[]',
  steps jsonb not null default '[]',
  substitutions jsonb default '[]',
  fixes jsonb default '[]',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table recipes enable row level security;

drop policy if exists "Rezepte lesen" on recipes;
create policy "Rezepte lesen"
  on recipes for select
  to authenticated
  using (true);

drop policy if exists "Rezepte schreiben (admin)" on recipes;
create policy "Rezepte schreiben (admin)"
  on recipes for insert
  to authenticated
  with check (is_admin());

drop policy if exists "Rezepte aendern (admin)" on recipes;
create policy "Rezepte aendern (admin)"
  on recipes for update
  to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "Rezepte loeschen (admin)" on recipes;
create policy "Rezepte loeschen (admin)"
  on recipes for delete
  to authenticated
  using (is_admin());

-- =============================================================================
-- Tabelle: profile (eine Zeile pro User)
-- =============================================================================
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  portions int default 2,
  max_time_minutes int default 60,
  allergies text[] default '{}',
  dislikes text[] default '{}',
  equipment text[] default '{}',
  notification_hour int default 10,
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

alter table profile alter column portions set default 2;
alter table profile alter column max_time_minutes set default 60;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'profile' and column_name = 'onboarding_completed'
  ) then
    alter table profile add column onboarding_completed boolean default false;
  end if;
end$$;

alter table profile enable row level security;

drop policy if exists "Eigenes Profil" on profile;
create policy "Eigenes Profil"
  on profile for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- Tabelle: daily_suggestions (pro User & Datum)
-- =============================================================================
create table if not exists daily_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  recipe_id uuid references recipes(id) on delete set null,
  status text check (status in ('pending', 'accepted', 'rejected', 'cooking', 'completed')) default 'pending',
  rejection_reason text,
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- Falls die alte Tabelle (ohne user_id) noch existiert, Spalte nachträglich anlegen
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'daily_suggestions' and column_name = 'user_id'
  ) then
    alter table daily_suggestions add column user_id uuid references auth.users(id) on delete cascade;
  end if;
end$$;

-- alte Unique-Constraint auf (date) entfernen, neue auf (user_id, date) anlegen
alter table daily_suggestions drop constraint if exists daily_suggestions_date_key;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'daily_suggestions_user_id_date_key'
  ) then
    alter table daily_suggestions add constraint daily_suggestions_user_id_date_key unique (user_id, date);
  end if;
end$$;

create index if not exists daily_suggestions_user_date_idx
  on daily_suggestions (user_id, date desc);

alter table daily_suggestions enable row level security;

drop policy if exists "Eigene Vorschlaege" on daily_suggestions;
create policy "Eigene Vorschlaege"
  on daily_suggestions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- Tabelle: feedback (pro User)
-- =============================================================================
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  suggestion_id uuid references daily_suggestions(id) on delete set null,
  recipe_id uuid references recipes(id) on delete set null,
  would_cook_again boolean,
  too_hard boolean default false,
  too_long boolean default false,
  created_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'feedback' and column_name = 'user_id'
  ) then
    alter table feedback add column user_id uuid references auth.users(id) on delete cascade;
  end if;
end$$;

create index if not exists feedback_user_idx on feedback (user_id);

alter table feedback enable row level security;

drop policy if exists "Eigenes Feedback" on feedback;
create policy "Eigenes Feedback"
  on feedback for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- Tabelle: alternative_surveys („Etwas anderes“ Umfrage, pro User)
-- =============================================================================
create table if not exists alternative_surveys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  suggestion_id uuid references daily_suggestions(id) on delete set null,
  recipe_id uuid references recipes(id) on delete set null,
  reason text not null check (
    reason in (
      'faster',
      'fewer_ingredients',
      'fewer_utensils',
      'dislike',
      'no_mood',
      'prefer_not_say',
      'specific_craving'
    )
  ),
  recipe_time_minutes int not null,
  recipe_ingredient_count int not null,
  recipe_pan_count int not null,
  craving_choice_ids text[] default '{}'
);

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'alternative_surveys' and column_name = 'user_id'
  ) then
    alter table alternative_surveys add column user_id uuid references auth.users(id) on delete cascade;
  end if;
end$$;

create index if not exists alternative_surveys_user_idx on alternative_surveys (user_id);

alter table alternative_surveys enable row level security;

drop policy if exists "Eigene Umfragen" on alternative_surveys;
create policy "Eigene Umfragen"
  on alternative_surveys for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- Tabelle: recommendation_signals (eine Zeile pro User)
-- Wir referenzieren direkt user_id, damit RLS einfach bleibt.
-- =============================================================================
create table if not exists recommendation_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  time_minutes_cap int,
  ingredient_count_cap int,
  pan_count_cap int,
  disliked_recipe_ids uuid[] default '{}',
  updated_at timestamptz default now()
);

-- alte Spalte profile_id (falls vorhanden) durch user_id ersetzen
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'recommendation_signals' and column_name = 'user_id'
  ) then
    alter table recommendation_signals add column user_id uuid references auth.users(id) on delete cascade;
  end if;
end$$;

alter table recommendation_signals drop constraint if exists recommendation_signals_profile_id_key;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'recommendation_signals_user_id_key'
  ) then
    alter table recommendation_signals add constraint recommendation_signals_user_id_key unique (user_id);
  end if;
end$$;

alter table recommendation_signals enable row level security;

drop policy if exists "Eigene Signale" on recommendation_signals;
create policy "Eigene Signale"
  on recommendation_signals for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- Trigger: bei jedem neuen Auth-User automatisch leeres Profil + Signale anlegen
-- =============================================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profile (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.recommendation_signals (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Bestehende User nachziehen (falls schon welche da sind)
insert into public.profile (user_id)
  select id from auth.users
  on conflict (user_id) do nothing;

insert into public.recommendation_signals (user_id)
  select id from auth.users
  on conflict (user_id) do nothing;

-- =============================================================================
-- Auto-update updated_at on recipes
-- =============================================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists recipes_updated_at on recipes;
create trigger recipes_updated_at
  before update on recipes
  for each row execute function update_updated_at();
