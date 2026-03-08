type UpdateBlockedTimeBody = {
  barberId?: string;
  startAt?: string;
  endAt?: string;
  reason?: string | null;
};

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const supabase = createSupabaseServerClient(event);
  const id = getRouterParam(event, "id") ?? "";
  const body = await readBody<UpdateBlockedTimeBody>(event);

  const payload = {
    barber_id: body.barberId,
    start_at: body.startAt,
    end_at: body.endAt,
    reason: body.reason,
  };

  const { data, error } = await supabase.from("blocked_times").update(payload).eq("id", id).select().single();

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  return data;
});
