-- Training Split — cloud data store
-- One row per logged-in user, mirroring the data that used to live in
-- the phone's local browser storage.

create table public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  workouts jsonb not null,
  day_names jsonb not null,
  workout_logs jsonb not null default '{}'::jsonb,
  rm_history jsonb not null default '{}'::jsonb,
  rm_lifts jsonb not null,
  rm_reps_lifts jsonb not null,
  font_size text not null default 'medium',
  schema_version integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

create policy "select own row" on public.user_data
  for select using (auth.uid() = user_id);

create policy "insert own row" on public.user_data
  for insert with check (auth.uid() = user_id);

create policy "update own row" on public.user_data
  for update using (auth.uid() = user_id);
