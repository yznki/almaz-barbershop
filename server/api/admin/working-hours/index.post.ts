type CreateWorkingHoursBody = {
  barberId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const supabase = createSupabaseServerClient(event);
  const body = await readBody<CreateWorkingHoursBody>(event);

  const { data, error } = await supabase
    .from("working_hours")
    .insert({
      barber_id: body.barberId,
      day_of_week: body.dayOfWeek,
      start_time: body.startTime,
      end_time: body.endTime,
    })
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  return data;
});
