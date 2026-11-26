-- Adds practices (treinos) next to tournaments.
-- Run once in the SQL Editor if you created your project with an older schema.sql.

alter table bp.tournaments
  add column if not exists kind text not null default 'torneio' check (kind in ('torneio','treino')),
  add column if not exists scope text check (scope in ('interno','parceria','externo')),
  add column if not exists partner text;

create or replace view public.bp_tournaments with (security_invoker = true) as select * from bp.tournaments;

drop view if exists bp.v_debates;
create view bp.v_debates with (security_invoker = true) as
select d.id, d.owner, t.name as tournament, t.kind as event_kind, t.scope as training_scope, t.partner,
  d.stage, d.round_no, d.label, d.motion, d.my_role,
  d.data->'teams'->'OG'->>'name' as og, d.data->'teams'->'OO'->>'name' as oo,
  d.data->'teams'->'CG'->>'name' as cg, d.data->'teams'->'CO'->>'name' as co,
  d.result->'order' as final_order, d.result->'advance' as advanced, d.result->>'winner' as winner,
  (d.result->>'split')::boolean as split, (d.result->>'me_minority')::boolean as me_in_minority,
  jsonb_array_length(coalesce(d.data->'args','[]'::jsonb)) as n_args, d.created_at, d.updated_at
from bp.debates d left join bp.tournaments t on t.id = d.tournament_id;
grant select on bp.v_debates to authenticated;
