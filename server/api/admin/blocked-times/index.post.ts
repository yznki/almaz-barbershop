type CreateBlockedTimeBody = {
  barberId: string;
  startAt: string;
  endAt: string;
  reason?: string | null;
};

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const supabase = createSupabaseServerClient(event);
  const body = await readBody<CreateBlockedTimeBody>(event);

  const { data, error } = await supabase
    .from("blocked_times")
    .insert({
      barber_id: body.barberId,
      start_at: body.startAt,
      end_at: body.endAt,
      reason: body.reason ?? null,
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
