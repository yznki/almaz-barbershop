import type { Tables, Database } from "../types/database";

type Barber = Tables<"barbers">;
type Service = Tables<"services">;
type AvailableSlot = Database["public"]["Functions"]["get_available_slots"]["Returns"][number];
type PublicAppointment = Database["public"]["Functions"]["create_public_appointment"]["Returns"];

type GetAvailableSlotsParams = {
  barberId: string;
  serviceId: string;
  date: string;
};

type CreateAppointmentPayload = {
  customerName: string;
  customerPhone: string;
  barberId: string;
  serviceId: string;
  startAt: string;
  notes?: string;
};

export const usePublicApi = () => {
  const getBarbers = () => {
    return useFetch<Barber[]>("/api/public/barbers", {
      key: "public-barbers",
    });
  };

  const getServices = () => {
    return useFetch<Service[]>("/api/public/services", {
      key: "public-services",
    });
  };

  const getAvailableSlots = (params: GetAvailableSlotsParams) => {
    return useFetch<AvailableSlot[]>("/api/public/slots", {
      key: `public-slots:${params.barberId}:${params.serviceId}:${params.date}`,
      query: params,
      immediate: Boolean(params.barberId && params.serviceId && params.date),
    });
  };

  const createAppointment = (payload: CreateAppointmentPayload) => {
    return $fetch<PublicAppointment>("/api/public/appointments", {
      method: "POST",
      body: payload,
    });
  };

  return {
    getBarbers,
    getServices,
    getAvailableSlots,
    createAppointment,
  };
};
