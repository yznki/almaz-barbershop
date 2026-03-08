export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const supabase = createSupabaseServerClient(event);
  const { data, error } = await supabase
    .from("appointments")
    .select("*, barbers(name), services(name)")
    .order("start_at", { ascending: false });

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
