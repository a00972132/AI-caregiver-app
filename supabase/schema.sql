create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  consented boolean not null default false,
  status text not null default 'in_progress',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.conversation_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  role text not null check (role in ('assistant', 'user')),
  prompt_type text not null check (prompt_type in ('initial', 'follow_up', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.sessions(id) on delete cascade,
  summary_json jsonb not null,
  summary_text text not null,
  edited_json jsonb,
  confirmed_at timestamptz
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  usefulness_rating text,
  comments text,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_user_id on public.sessions(user_id);
create index if not exists idx_conversation_turns_session_id on public.conversation_turns(session_id);
create index if not exists idx_feedback_session_id on public.feedback(session_id);
