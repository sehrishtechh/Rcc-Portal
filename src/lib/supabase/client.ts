"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnvironment } from "./env";

export function createClient() {
  const environment = getSupabaseEnvironment();
  if (!environment) {
    throw new Error("Supabase is not configured. Add the project URL and publishable key to .env.local.");
  }

  return createBrowserClient(environment.url, environment.publishableKey);
}
