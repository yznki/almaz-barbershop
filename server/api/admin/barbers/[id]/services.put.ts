type BarberServiceAssignmentBody = {
  assignments: Array<{
    serviceId: string;
    active?: boolean;
    durationOverrideMinutes?: number | null;
    priceOverride?: number | null;
  }>;
};

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const supabase = createSupabaseServerClient(event);
  const barberId = getRouterParam(event, "id") ?? "";
  const body = await readBody<BarberServiceAssignmentBody>(event);

  const assignments = (body.assignments ?? []).filter((assignment) => assignment.serviceId);
  const uniqueServiceIds = [...new Set(assignments.map((assignment) => assignment.serviceId))];

  const { data: services, error: servicesError } = await supabase.from("services").select("id").in("id", uniqueServiceIds);

  if (servicesError) {
    throw createError({
      statusCode: 400,
      statusMessage: servicesError.message,
    });
  }

  if ((services?.length ?? 0) !== uniqueServiceIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "One or more services are invalid",
    });
  }

  const { error: deleteError } = await supabase.from("barber_services").delete().eq("barber_id", barberId);

  if (deleteError) {
    throw createError({
      statusCode: 400,
      statusMessage: deleteError.message,
    });
  }

  if (!assignments.length) {
    return [];
  }

  const sanitizedAssignments = assignments.map((assignment) => ({
    barber_id: barberId,
    service_id: assignment.serviceId,
    active: assignment.active ?? true,
    duration_override_minutes: assignment.durationOverrideMinutes ?? null,
    price_override: assignment.priceOverride ?? null,
  }));

  const { data, error } = await supabase.from("barber_services").insert(sanitizedAssignments).select("*");

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  return data;
});
