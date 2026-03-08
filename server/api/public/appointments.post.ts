import { publicAppointmentSchema } from "@/schemas/public-appointment";

const pad = (value: number) => String(value).padStart(2, "0");

const toLocalDateTimeString = (value: Date) => {
  const year = value.getFullYear();
  const month = pad(value.getMonth() + 1);
  const day = pad(value.getDate());
  const hours = pad(value.getHours());
  const minutes = pad(value.getMinutes());
  const seconds = pad(value.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

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
  const startAt = new Date(body.startAt);

  if (Number.isNaN(startAt.getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid appointment time",
    });
  }

  const [{ data: service, error: serviceError }, { data: combo, error: comboError }] = await Promise.all([
    supabase.from("services").select("duration_minutes").eq("id", body.serviceId).single(),
    supabase
      .from("barber_services")
      .select("id, active, duration_override_minutes")
      .eq("barber_id", body.barberId)
      .eq("service_id", body.serviceId)
      .maybeSingle(),
  ]);

  const setupError = serviceError ?? comboError;

  if (setupError) {
    throw createError({
      statusCode: 400,
      statusMessage: setupError.message,
    });
  }

  if (!service || !combo?.active) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid barber/service combination",
    });
  }

  const durationMs = (combo.duration_override_minutes ?? service.duration_minutes) * 60 * 1000;
  const endAt = new Date(startAt.getTime() + durationMs);
  const startAtValue = toLocalDateTimeString(startAt);
  const endAtValue = toLocalDateTimeString(endAt);

  const [{ data: conflictingAppointments, error: appointmentConflictError }, { data: conflictingBlocks, error: blockedConflictError }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select("id")
        .eq("barber_id", body.barberId)
        .neq("status", "cancelled")
        .lt("start_at", endAtValue)
        .gt("end_at", startAtValue)
        .limit(1),
      supabase
        .from("blocked_times")
        .select("id")
        .eq("barber_id", body.barberId)
        .lt("start_at", endAtValue)
        .gt("end_at", startAtValue)
        .limit(1),
    ]);

  const conflictError = appointmentConflictError ?? blockedConflictError;

  if (conflictError) {
    throw createError({
      statusCode: 400,
      statusMessage: conflictError.message,
    });
  }

  if (conflictingAppointments?.length || conflictingBlocks?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Selected slot is no longer available",
    });
  }

  const { data, error } = await supabase.rpc("create_public_appointment", {
    p_customer_name: body.customerName,
    p_customer_phone: body.customerPhone,
    p_barber_id: body.barberId,
    p_service_id: body.serviceId,
    p_start_at: startAtValue,
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
