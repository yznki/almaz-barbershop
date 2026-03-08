type CreateServiceBody = {
  name: string;
  durationMinutes: number;
  price: number;
  active?: boolean;
};

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const supabase = createSupabaseServerClient(event);
  const body = await readBody<CreateServiceBody>(event);

  const { data, error } = await supabase
    .from("services")
    .insert({
      name: body.name,
      duration_minutes: body.durationMinutes,
      price: body.price,
      active: body.active ?? true,
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
