export default defineEventHandler(async (event) => {
  const supabase = createSupabaseServerClient(event);
  const result = publicSlotsSchema.safeParse(getQuery(event));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: getValidationErrorMessage(result.error),
    });
  }

  const { barberId, serviceId, date } = result.data;

  const { data, error } = await supabase.rpc("get_available_slots", {
    p_barber_id: barberId,
    p_service_id: serviceId,
    p_date: date,
  });

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  return data;
});
