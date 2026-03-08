export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const supabase = createSupabaseServerClient(event);
  const barberId = getRouterParam(event, "id") ?? "";

  const [{ data: services, error: servicesError }, { data: assignments, error: assignmentsError }] = await Promise.all([
    supabase.from("services").select("*").order("name", { ascending: true }),
    supabase.from("barber_services").select("*").eq("barber_id", barberId),
  ]);

  const error = servicesError ?? assignmentsError;

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  const assignmentMap = new Map((assignments ?? []).map((assignment) => [assignment.service_id, assignment]));

  return (services ?? []).map((service) => {
    const assignment = assignmentMap.get(service.id);

    return {
      service,
      assigned: Boolean(assignment),
      assignment: assignment
        ? {
            id: assignment.id,
            active: assignment.active,
            durationOverrideMinutes: assignment.duration_override_minutes,
            priceOverride: assignment.price_override,
          }
        : null,
    };
  });
});
