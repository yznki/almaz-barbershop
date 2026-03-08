type CreateBarberBody = {
  name: string;
  active?: boolean;
};

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const supabase = createSupabaseServerClient(event);
  const body = await readBody<CreateBarberBody>(event);

  const { data, error } = await supabase
    .from("barbers")
    .insert({
      name: body.name,
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
