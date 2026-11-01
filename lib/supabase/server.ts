import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Creates a connection to your Supabase project for code that runs on the
// server (pages, form actions). It reads the visitor's sign-in cookie so
// Supabase knows who is asking, and the privacy rules apply to that person.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Pages can't write cookies; proxy.ts keeps the session fresh instead.
          }
        },
      },
    },
  );
}
