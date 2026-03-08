export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const supabase = createSupabaseServerClient(event);
  const id = getRouterParam(event, "id") ?? "";

  const { error } = await supabase.from("blocked_times").delete().eq("id", id);

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  return { success: true };
});
