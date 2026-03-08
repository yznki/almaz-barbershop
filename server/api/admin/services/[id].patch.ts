type UpdateServiceBody = {
  name?: string;
  durationMinutes?: number;
  price?: number;
  active?: boolean;
};

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const supabase = createSupabaseServerClient(event);
  const id = getRouterParam(event, "id") ?? "";
  const body = await readBody<UpdateServiceBody>(event);

  const payload = {
    name: body.name,
    duration_minutes: body.durationMinutes,
    price: body.price,
    active: body.active,
  };

  const { data, error } = await supabase.from("services").update(payload).eq("id", id).select().single();

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  return data;
});
