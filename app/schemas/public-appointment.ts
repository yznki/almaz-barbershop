import { z } from "zod";

export const publicAppointmentSchema = z.object({
  customerName: z.string().trim().min(1, "customerName is required"),
  customerPhone: z.string().trim().min(1, "customerPhone is required"),
  barberId: z.string().trim().min(1, "barberId is required"),
  serviceId: z.string().trim().min(1, "serviceId is required"),
  startAt: z.string().trim().min(1, "startAt is required"),
  notes: z.string().optional(),
});

export type PublicAppointmentInput = z.infer<typeof publicAppointmentSchema>;
