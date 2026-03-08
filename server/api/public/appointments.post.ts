export default defineEventHandler(async (event) => {
  const supabase = createSupabaseServerClient(event);
  const result = publicAppointmentSchema.safeParse(await readBody(event));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: getValidationErrorMessage(result.error),
    });
  }

  const body = result.data;

  const { data, error } = await supabase.rpc("create_public_appointment", {
    p_customer_name: body.customerName,
    p_customer_phone: body.customerPhone,
    p_barber_id: body.barberId,
    p_service_id: body.serviceId,
    p_start_at: body.startAt,
    p_notes: body.notes,
  });

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  return data;
});
