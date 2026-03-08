export default defineEventHandler(async (event) => {
  const supabase = createSupabaseServerClient(event);
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  if (!data.user) {
    return {
      authenticated: false,
      user: null,
      role: null,
    };
  }

  const { data: profileData, error: profileDataError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileDataError) {
    throw createError({
      statusCode: 400,
      statusMessage: profileDataError.message,
    });
  }

  return {
    authenticated: true,
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
      fullName: profileData?.full_name ?? (data.user.user_metadata.full_name as string | null | undefined) ?? null,
    },
    role: profileData?.role ?? null,
  };
});
