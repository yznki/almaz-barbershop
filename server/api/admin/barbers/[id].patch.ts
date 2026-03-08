type UpdateBarberBody = {
  name?: string;
  active?: boolean;
};

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const supabase = createSupabaseServerClient(event);
  const id = getRouterParam(event, "id") ?? "";
  const body = await readBody<UpdateBarberBody>(event);

  const { data, error } = await supabase.from("barbers").update(body).eq("id", id).select().single();

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  return data;
});
