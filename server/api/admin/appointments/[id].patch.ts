type UpdateAppointmentBody = {
  customerName?: string;
  customerPhone?: string;
  barberId?: string;
  serviceId?: string;
  startAt?: string;
  endAt?: string;
  status?: "booked" | "cancelled" | "completed";
  notes?: string | null;
};

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const supabase = createSupabaseServerClient(event);
  const id = getRouterParam(event, "id") ?? "";
  const body = await readBody<UpdateAppointmentBody>(event);

  const payload = {
    customer_name: body.customerName,
    customer_phone: body.customerPhone,
    barber_id: body.barberId,
    service_id: body.serviceId,
    start_at: body.startAt,
    end_at: body.endAt,
    status: body.status,
    notes: body.notes,
  };

  const { data, error } = await supabase.from("appointments").update(payload).eq("id", id).select().single();

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  return data;
});
