import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../types/database";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const useSupabase = () => {
  if (client) {
    return client;
  }

  const config = useRuntimeConfig();

  client = createBrowserClient<Database>(config.public.supabaseUrl, config.public.supabasePublishableKey);

  return client;
};
