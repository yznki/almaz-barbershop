import { z } from "zod";

export const publicSlotsSchema = z.object({
  barberId: z.string().trim().min(1, "barberId is required"),
  serviceId: z.string().trim().min(1, "serviceId is required"),
  date: z.string().trim().min(1, "date is required"),
});

export type PublicSlotsInput = z.infer<typeof publicSlotsSchema>;
