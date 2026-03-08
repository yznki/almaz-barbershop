import type { Tables } from "@/app/types/database";

type Profile = Tables<"profiles">;

export const requireAdminUser = async (event: H3EventContext) => {
  const supabase = createSupabaseServerClient(event);
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", authData.user.id).maybeSingle();

  if (profileError) {
    throw createError({
      statusCode: 400,
      statusMessage: profileError.message,
    });
  }

  if (!profile || profile.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  return {
    user: authData.user,
    profile: profile as Profile,
  };
};
