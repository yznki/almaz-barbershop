import type { Tables, Database } from "../types/database";

type Barber = Tables<"barbers">;
type Appointment = Tables<"appointments">;
type Service = Tables<"services">;
type AvailableSlot = Database["public"]["Functions"]["get_available_slots"]["Returns"][number];
type PublicAppointment = Appointment;

type GetAvailableSlotsParams = {
  barberId: string;
  serviceId: string;
  date: string;
};

type GetServicesParams = {
  barberId?: string;
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

  const getServices = (params?: GetServicesParams) => {
    return $fetch<Service[]>("/api/public/services", { query: params });
  };

  const getAvailableSlots = (params: GetAvailableSlotsParams) => {
    return $fetch<AvailableSlot[]>("/api/public/slots", { query: params });
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
