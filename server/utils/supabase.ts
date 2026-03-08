import type { Database } from "@/app/types/database";
import { createServerClient } from "@supabase/ssr";

export const createSupabaseServerClient = (event: any) => {
  const config = useRuntimeConfig(event);

  return createServerClient<Database>(config.public.supabaseUrl, config.public.supabasePublishableKey, {
    cookies: {
      getAll() {
        return Object.entries(parseCookies(event)).map(([name, value]) => ({
          name,
          value,
        }));
      },
      setAll(cookies) {
        for (const cookie of cookies) {
          setCookie(event, cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });
};
