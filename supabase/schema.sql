-- BP Judging Sheet: schema for your own Supabase project.
-- Run once in the Supabase SQL Editor. Each user only sees their own rows (RLS).

create schema if not exists bp;
grant usage on schema bp to authenticated;

create table bp.tournaments (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  starts_on date,
  ends_on date,
  location text,
  notes text,
  kind text not null default 'torneio' check (kind in ('torneio','treino')),
  scope text check (scope in ('interno','parceria','externo')),
  partner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table bp.debates (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tournament_id uuid references bp.tournaments(id) on delete cascade,
  stage text not null default 'preliminar' check (stage in ('preliminar','octavas','quartas','semi','final','outra')),
  round_no int,
  label text,
  motion text,
  my_role text check (my_role in ('chair','wing','trainee')),
  data jsonb not null default '{}'::jsonb,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on bp.debates(owner);
create index on bp.debates(tournament_id);
create index on bp.tournaments(owner);

create or replace function bp.touch() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger t_touch before update on bp.tournaments for each row execute function bp.touch();
create trigger d_touch before update on bp.debates for each row execute function bp.touch();

alter table bp.tournaments enable row level security;
alter table bp.debates enable row level security;
create policy own_t on bp.tournaments for all to authenticated
  using (owner = (select auth.uid())) with check (owner = (select auth.uid()));
create policy own_d on bp.debates for all to authenticated
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()) and (tournament_id is null or exists (
    select 1 from bp.tournaments t where t.id = tournament_id and t.owner = (select auth.uid()))));
grant select, insert, update, delete on bp.tournaments, bp.debates to authenticated;

-- API surface: security_invoker views in the public schema (table RLS applies)
create view public.bp_tournaments with (security_invoker = true) as select * from bp.tournaments;
create view public.bp_debates with (security_invoker = true) as select * from bp.debates;
revoke all on public.bp_tournaments, public.bp_debates from anon, public;
grant select, insert, update, delete on public.bp_tournaments, public.bp_debates to authenticated;

-- Analysis views (query them in the SQL Editor; not exposed through the API)
create view bp.v_debates with (security_invoker = true) as
select d.id, d.owner, t.name as tournament, t.kind as event_kind, t.scope as training_scope, t.partner,
  d.stage, d.round_no, d.label, d.motion, d.my_role,
  d.data->'teams'->'OG'->>'name' as og, d.data->'teams'->'OO'->>'name' as oo,
  d.data->'teams'->'CG'->>'name' as cg, d.data->'teams'->'CO'->>'name' as co,
  d.result->'order' as final_order, d.result->'advance' as advanced, d.result->>'winner' as winner,
  (d.result->>'split')::boolean as split, (d.result->>'me_minority')::boolean as me_in_minority,
  jsonb_array_length(coalesce(d.data->'args','[]'::jsonb)) as n_args, d.created_at, d.updated_at
from bp.debates d left join bp.tournaments t on t.id = d.tournament_id;

create view bp.v_arguments with (security_invoker = true) as
select d.id as debate_id, d.owner, t.name as tournament, d.stage, d.round_no, d.motion,
  a->>'sp' as speech,
  case when a->>'sp' in ('PM','DPM') then 'OG' when a->>'sp' in ('LO','DLO') then 'OO'
       when a->>'sp' in ('MG','GW') then 'CG' else 'CO' end as team,
  a->>'title' as title, a->>'why' as mechanism, a->>'imp' as impact,
  a->>'q' as quality, a->>'kind' as kind, a->>'res' as outcome, a->'to' as responds_to, a->>'id' as arg_id
from bp.debates d left join bp.tournaments t on t.id = d.tournament_id,
lateral jsonb_array_elements(coalesce(d.data->'args','[]'::jsonb)) a;

create view bp.v_speaks with (security_invoker = true) as
select d.id as debate_id, d.owner, t.name as tournament, d.stage, d.round_no, s.key as speech,
  case when s.key in ('PM','DPM') then 'OG' when s.key in ('LO','DLO') then 'OO'
       when s.key in ('MG','GW') then 'CG' else 'CO' end as team,
  nullif(s.value #>> '{}','')::numeric as final_score
from bp.debates d left join bp.tournaments t on t.id = d.tournament_id,
lateral jsonb_each(coalesce(d.result->'speaks','{}'::jsonb)) s;
grant select on bp.v_debates, bp.v_arguments, bp.v_speaks to authenticated;
