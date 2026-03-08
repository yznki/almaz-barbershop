export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-AT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export const formatLongDate = (value: string) =>
  new Intl.DateTimeFormat("en-AT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export const formatTime = (value: string) => {
  const [hours = "00", minutes = "00"] = value.split(":");
  return `${hours}:${minutes}`;
};

export const formatTimeRange = (start: string, end: string) => `${formatTime(start)} - ${formatTime(end)}`;

export const getDayName = (dayOfWeek: number) =>
  ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek] ?? "Unknown";

export const getRequestErrorMessage = (error: unknown) => {
  if (error && typeof error === "object") {
    const value = error as {
      data?: { statusMessage?: string };
      statusMessage?: string;
      message?: string;
    };

    return value.data?.statusMessage ?? value.statusMessage ?? value.message ?? "Something went wrong";
  }

  return typeof error === "string" ? error : "Something went wrong";
};
