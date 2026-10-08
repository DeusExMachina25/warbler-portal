-- Supabase's security check flagged that two helper functions could be
-- called directly over the web API. Neither needs to be:
-- * handle_new_user only runs from the sign-up trigger.
-- * is_admin is only used inside access rules for signed-in users.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
