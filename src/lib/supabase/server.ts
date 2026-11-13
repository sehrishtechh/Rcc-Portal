import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnvironment } from "./env";

export async function createClient() {
  const environment = getSupabaseEnvironment();
  if (!environment) {
    throw new Error("Supabase is not configured. Add the project URL and publishable key to .env.local.");
  }

  const cookieStore = await cookies();

  return createServerClient(environment.url, environment.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. The Proxy refreshes them.
        }
      },
    },
  });
}
