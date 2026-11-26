-- A debate can only be attached to a tournament/practice owned by the same user.
drop policy if exists own_d on bp.debates;
create policy own_d on bp.debates for all to authenticated
  using (owner = (select auth.uid()))
  with check (
    owner = (select auth.uid())
    and (tournament_id is null or exists (
      select 1 from bp.tournaments t where t.id = tournament_id and t.owner = (select auth.uid())
    ))
  );
