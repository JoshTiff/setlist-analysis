import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

let browserClient: SupabaseClient<Database> | null = null;

export function createBrowserSupabaseClient(): SupabaseClient<Database> {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!supabasePublishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  browserClient = createClient<Database>(supabaseUrl, supabasePublishableKey);

  return browserClient;
}