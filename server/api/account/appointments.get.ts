export default defineEventHandler(async (event) => {
  const supabase = createSupabaseServerClient(event);
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    throw createError({
      statusCode: 400,
      statusMessage: profileError.message,
    });
  }

  if (!profile?.full_name) {
    return [];
  }

  const { data, error } = await supabase
    .from("appointments")
    .select("*, barbers(name), services(name)")
    .eq("customer_name", profile.full_name)
    .order("start_at", { ascending: true });

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  return (data ?? []).map((appointment) => ({
    ...appointment,
    barber_name: appointment.barbers?.name ?? null,
    service_name: appointment.services?.name ?? null,
  }));
});
