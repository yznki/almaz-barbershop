import { authSignupSchema } from "@/schemas/auth-signup";

export default defineEventHandler(async (event) => {
  const result = authSignupSchema.safeParse(await readBody(event));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: getValidationErrorMessage(result.error),
    });
  }

  const supabase = createSupabaseServerClient(event);
  const { fullName, email, password } = result.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error || !data.user) {
    throw createError({
      statusCode: 400,
      statusMessage: error?.message ?? "Signup failed",
    });
  }

  const role = "customer";

  await supabase.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    role,
  });

  return {
    authenticated: Boolean(data.session),
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
      fullName,
    },
    role,
    emailConfirmationRequired: !data.session,
  };
});
