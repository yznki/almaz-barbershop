import { publicSlotsSchema } from "@/schemas/public-slots";

const pad = (value: number) => String(value).padStart(2, "0");

const toLocalDateTimeString = (value: Date) => {
  const year = value.getFullYear();
  const month = pad(value.getMonth() + 1);
  const day = pad(value.getDate());
  const hours = pad(value.getHours());
  const minutes = pad(value.getMinutes());
  const seconds = pad(value.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export default defineEventHandler(async (event) => {
  const supabase = createSupabaseServerClient(event);
  const result = publicSlotsSchema.safeParse(getQuery(event));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: getValidationErrorMessage(result.error),
    });
  }

  const { barberId, serviceId, date } = result.data;
  const targetDate = new Date(`${date}T00:00:00`);
  const dayOfWeek = targetDate.getDay();
  const dayStart = `${date}T00:00:00`;
  const dayEnd = `${date}T23:59:59`;

  const [
    { data: service, error: serviceError },
    { data: barberService, error: barberServiceError },
    { data: workingHours, error: workingHoursError },
    { data: blockedTimes, error: blockedTimesError },
    { data: appointments, error: appointmentsError },
  ] =
    await Promise.all([
      supabase.from("services").select("duration_minutes").eq("id", serviceId).single(),
      supabase
        .from("barber_services")
        .select("active, duration_override_minutes")
        .eq("barber_id", barberId)
        .eq("service_id", serviceId)
        .maybeSingle(),
      supabase
        .from("working_hours")
        .select("start_time, end_time")
        .eq("barber_id", barberId)
        .eq("day_of_week", dayOfWeek)
        .order("start_time"),
      supabase
        .from("blocked_times")
        .select("start_at, end_at")
        .eq("barber_id", barberId)
        .lt("start_at", dayEnd)
        .gt("end_at", dayStart),
      supabase
        .from("appointments")
        .select("start_at, end_at, status")
        .eq("barber_id", barberId)
        .neq("status", "cancelled")
        .lt("start_at", dayEnd)
        .gt("end_at", dayStart),
    ]);

  const error = serviceError ?? barberServiceError ?? workingHoursError ?? blockedTimesError ?? appointmentsError;

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  if (!service || !barberService?.active || !workingHours?.length) {
    return [];
  }

  const durationMs = (barberService.duration_override_minutes ?? service.duration_minutes) * 60 * 1000;
  const stepMs = 30 * 60 * 1000;
  const busyWindows = [...(blockedTimes ?? []), ...(appointments ?? [])].map((item) => ({
    start: new Date(item.start_at).getTime(),
    end: new Date(item.end_at).getTime(),
  }));

  const slots = (workingHours ?? []).flatMap((window) => {
    const start = new Date(`${date}T${window.start_time}`);
    const end = new Date(`${date}T${window.end_time}`);
    const results: Array<{ slot_start: string; slot_end: string }> = [];

    for (let cursor = start.getTime(); cursor + durationMs <= end.getTime(); cursor += stepMs) {
      const slotStart = cursor;
      const slotEnd = cursor + durationMs;
      const overlapsBusyWindow = busyWindows.some((item) => slotStart < item.end && slotEnd > item.start);

      if (!overlapsBusyWindow) {
        results.push({
          slot_start: toLocalDateTimeString(new Date(slotStart)),
          slot_end: toLocalDateTimeString(new Date(slotEnd)),
        });
      }
    }

    return results;
  });

  return slots;
});
