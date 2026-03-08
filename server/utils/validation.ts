import type { ZodError } from "zod";

export const getValidationErrorMessage = (error: ZodError) => {
  return error.issues[0]?.message ?? "Invalid request";
};
