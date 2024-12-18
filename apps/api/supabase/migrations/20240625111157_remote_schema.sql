create or replace view "private"."current_user_teams" as  SELECT ( SELECT auth.uid() AS uid) AS user_id,
    t.team_id
   FROM users_on_team t
  WHERE (t.user_id = ( SELECT auth.uid() AS uid));

grant select on "private"."current_user_teams" to authenticated;

set check_function_bodies = off;

create or replace view "public"."current_user_teams" as  SELECT ( SELECT auth.uid() AS uid) AS user_id,
    t.team_id
   FROM users_on_team t
  WHERE (t.user_id = ( SELECT auth.uid() AS uid));

grant select on "public"."current_user_teams" to authenticated;

CREATE OR REPLACE FUNCTION public.get_current_user_team_id()
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN (SELECT team_id FROM users WHERE id = (SELECT auth.uid()));
END;
$function$
;

create policy "Enable read access for team members"
on "public"."users_on_team"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM private.current_user_teams cut
  WHERE ((cut.user_id = ( SELECT auth.uid() AS uid)) AND (cut.team_id = users_on_team.team_id)))));
