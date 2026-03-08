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

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();

  if (profileError) {
    throw createError({
      statusCode: 400,
      statusMessage: profileError.message,
    });
  }

  return {
    authenticated: true,
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
    },
    role: profile?.role ?? null,
  };
});
