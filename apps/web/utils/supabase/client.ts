import { createBrowserClient } from "@supabase/ssr";

function requirePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return { url, publishableKey };
}

export function createClient() {
  const { url, publishableKey } = requirePublicConfig();
  return createBrowserClient(url, publishableKey);
}
