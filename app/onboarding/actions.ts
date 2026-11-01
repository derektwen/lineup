"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Saves a new row in the profiles table for the signed-in person.
export async function createProfile(formData: FormData) {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .insert({ id: userId, username, display_name: displayName });

  if (error) {
    // 23505 is the database's code for "that value is already taken".
    const message =
      error.code === "23505"
        ? `@${username} is taken. Try another.`
        : "Couldn't save your profile. Check the username and try again.";
    redirect(`/onboarding?error=${encodeURIComponent(message)}`);
  }
  redirect("/");
}
