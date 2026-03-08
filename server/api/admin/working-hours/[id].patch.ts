type UpdateWorkingHoursBody = {
  barberId?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
};

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const supabase = createSupabaseServerClient(event);
  const id = getRouterParam(event, "id") ?? "";
  const body = await readBody<UpdateWorkingHoursBody>(event);

  const payload = {
    barber_id: body.barberId,
    day_of_week: body.dayOfWeek,
    start_time: body.startTime,
    end_time: body.endTime,
  };

  const { data, error } = await supabase.from("working_hours").update(payload).eq("id", id).select().single();

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  return data;
});
