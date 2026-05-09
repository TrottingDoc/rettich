-- Rett:ich database schema
-- Run this in your Supabase SQL editor to set up the database.

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

create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  portions int default 1,
  max_time_minutes int default 30,
  allergies text[] default '{}',
  dislikes text[] default '{}',
  equipment text[] default '{}',
  notification_hour int default 10,
  created_at timestamptz default now()
);

create table if not exists daily_suggestions (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  recipe_id uuid references recipes(id),
  status text check (status in ('pending', 'accepted', 'rejected', 'cooking', 'completed')) default 'pending',
  rejection_reason text,
  created_at timestamptz default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid references daily_suggestions(id),
  recipe_id uuid references recipes(id),
  would_cook_again boolean,
  too_hard boolean default false,
  too_long boolean default false,
  created_at timestamptz default now()
);

-- Umfrage „Etwas anderes“ (Gründe + Rezeptmetriken zum Auswerten / Vergleichen)
create table if not exists alternative_surveys (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  suggestion_id uuid references daily_suggestions(id),
  recipe_id uuid references recipes(id),
  reason text not null check (
    reason in (
      'faster',
      'fewer_ingredients',
      'fewer_utensils',
      'dislike',
      'no_mood',
      'prefer_not_say'
    )
  ),
  recipe_time_minutes int not null,
  recipe_ingredient_count int not null,
  recipe_pan_count int not null
);

-- Abgeleitete Grenzwerte für Empfehlungen (pro Nutzer/in eher eine Zeile in profile erweitern; hier als eigene Tabelle skizziert)
create table if not exists recommendation_signals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profile(id) on delete cascade,
  time_minutes_cap int,
  ingredient_count_cap int,
  pan_count_cap int,
  disliked_recipe_ids uuid[] default '{}',
  updated_at timestamptz default now(),
  unique (profile_id)
);

-- Auto-update updated_at on recipes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recipes_updated_at
  before update on recipes
  for each row execute function update_updated_at();
