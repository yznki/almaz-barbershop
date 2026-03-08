export default defineEventHandler(async (event) => {
  const supabase = createSupabaseServerClient(event);

  const { data, error } = await supabase.from("barbers").select("*").eq("active", true).order("name");

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  return data;
});
