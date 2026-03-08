import type { Enums, Tables } from "../types/database";

type AppointmentStatus = Enums<"appointment_status">;
type Appointment = Tables<"appointments">;
type Barber = Tables<"barbers">;
type BlockedTime = Tables<"blocked_times">;
type Service = Tables<"services">;
type WorkingHour = Tables<"working_hours">;

type CreateBarberPayload = {
  name: string;
  active?: boolean;
};

type UpdateBarberPayload = {
  name?: string;
  active?: boolean;
};

type CreateServicePayload = {
  name: string;
  durationMinutes: number;
  price: number;
  active?: boolean;
};

type UpdateServicePayload = {
  name?: string;
  durationMinutes?: number;
  price?: number;
  active?: boolean;
};

type UpdateAppointmentPayload = {
  customerName?: string;
  customerPhone?: string;
  barberId?: string;
  serviceId?: string;
  startAt?: string;
  endAt?: string;
  status?: AppointmentStatus;
  notes?: string | null;
};

type CreateWorkingHoursPayload = {
  barberId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type UpdateWorkingHoursPayload = {
  barberId?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
};

type CreateBlockedTimePayload = {
  barberId: string;
  startAt: string;
  endAt: string;
  reason?: string | null;
};

type UpdateBlockedTimePayload = {
  barberId?: string;
  startAt?: string;
  endAt?: string;
  reason?: string | null;
};

export const useAdminApi = () => {
  const getBarbers = () => {
    return useFetch<Barber[]>("/api/admin/barbers", {
      key: "admin-barbers",
    });
  };

  const createBarber = (payload: CreateBarberPayload) => {
    return $fetch<Barber>("/api/admin/barbers", {
      method: "POST",
      body: payload,
    });
  };

  const updateBarber = (id: string, payload: UpdateBarberPayload) => {
    return $fetch<Barber>(`/api/admin/barbers/${id}`, {
      method: "PATCH",
      body: payload,
    });
  };

  const deleteBarber = (id: string) => {
    return $fetch<{ success: true }>(`/api/admin/barbers/${id}`, {
      method: "DELETE",
    });
  };

  const getServices = () => {
    return useFetch<Service[]>("/api/admin/services", {
      key: "admin-services",
    });
  };

  const createService = (payload: CreateServicePayload) => {
    return $fetch<Service>("/api/admin/services", {
      method: "POST",
      body: payload,
    });
  };

  const updateService = (id: string, payload: UpdateServicePayload) => {
    return $fetch<Service>(`/api/admin/services/${id}`, {
      method: "PATCH",
      body: payload,
    });
  };

  const deleteService = (id: string) => {
    return $fetch<{ success: true }>(`/api/admin/services/${id}`, {
      method: "DELETE",
    });
  };

  const getAppointments = () => {
    return useFetch<Appointment[]>("/api/admin/appointments", {
      key: "admin-appointments",
    });
  };

  const updateAppointment = (id: string, payload: UpdateAppointmentPayload) => {
    return $fetch<Appointment>(`/api/admin/appointments/${id}`, {
      method: "PATCH",
      body: payload,
    });
  };

  const getWorkingHours = () => {
    return useFetch<WorkingHour[]>("/api/admin/working-hours", {
      key: "admin-working-hours",
    });
  };

  const createWorkingHours = (payload: CreateWorkingHoursPayload) => {
    return $fetch<WorkingHour>("/api/admin/working-hours", {
      method: "POST",
      body: payload,
    });
  };

  const updateWorkingHours = (id: string, payload: UpdateWorkingHoursPayload) => {
    return $fetch<WorkingHour>(`/api/admin/working-hours/${id}`, {
      method: "PATCH",
      body: payload,
    });
  };

  const deleteWorkingHours = (id: string) => {
    return $fetch<{ success: true }>(`/api/admin/working-hours/${id}`, {
      method: "DELETE",
    });
  };

  const getBlockedTimes = () => {
    return useFetch<BlockedTime[]>("/api/admin/blocked-times", {
      key: "admin-blocked-times",
    });
  };

  const createBlockedTime = (payload: CreateBlockedTimePayload) => {
    return $fetch<BlockedTime>("/api/admin/blocked-times", {
      method: "POST",
      body: payload,
    });
  };

  const updateBlockedTime = (id: string, payload: UpdateBlockedTimePayload) => {
    return $fetch<BlockedTime>(`/api/admin/blocked-times/${id}`, {
      method: "PATCH",
      body: payload,
    });
  };

  const deleteBlockedTime = (id: string) => {
    return $fetch<{ success: true }>(`/api/admin/blocked-times/${id}`, {
      method: "DELETE",
    });
  };

  return {
    getBarbers,
    createBarber,
    updateBarber,
    deleteBarber,
    getServices,
    createService,
    updateService,
    deleteService,
    getAppointments,
    updateAppointment,
    getWorkingHours,
    createWorkingHours,
    updateWorkingHours,
    deleteWorkingHours,
    getBlockedTimes,
    createBlockedTime,
    updateBlockedTime,
    deleteBlockedTime,
  };
};
