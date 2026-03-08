export default defineEventHandler(async (event) => {
  const result = authLoginSchema.safeParse(await readBody(event));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: getValidationErrorMessage(result.error),
    });
  }

  const supabase = createSupabaseServerClient(event);
  const { data, error } = await supabase.auth.signInWithPassword(result.data);

  if (error || !data.user) {
    throw createError({
      statusCode: 401,
      statusMessage: error?.message ?? "Login failed",
    });
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
