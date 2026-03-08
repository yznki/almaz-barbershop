export default defineEventHandler(async (event) => {
  const supabase = createSupabaseServerClient(event);
  const barberId = getQuery(event).barberId;

  if (typeof barberId === "string" && barberId.length > 0) {
    const { data, error } = await supabase
      .from("barber_services")
      .select("duration_override_minutes, price_override, services(*)")
      .eq("barber_id", barberId)
      .eq("active", true);

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message,
      });
    }

    return (data ?? [])
      .map((item) => {
        const service = Array.isArray(item.services) ? item.services[0] : item.services;

        if (!service || !service.active) {
          return null;
        }

        return {
          ...service,
          duration_minutes: item.duration_override_minutes ?? service.duration_minutes,
          price: item.price_override ?? service.price,
        };
      })
      .filter(Boolean)
      .sort((left, right) => left!.name.localeCompare(right!.name));
  }

  const { data, error } = await supabase.from("services").select("*").eq("active", true).order("name");

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  return data;
});
