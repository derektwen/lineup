"use server";

import { revalidatePath } from "next/cache";
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
    // 23505 means "this would create a duplicate". It can be a duplicate
    // username (someone else has it) or a duplicate person (you already
    // have a profile). Only the first one is a real problem.
    const isDuplicate = error.code === "23505";
    const usernameTaken = isDuplicate && error.message.includes("username");

    if (isDuplicate && !usernameTaken) {
      // Your profile already exists, so there's nothing to fix.
      revalidatePath("/", "layout");
      redirect("/");
    }

    const message = usernameTaken
      ? `@${username} is taken. Try another.`
      : `Couldn't save your profile (${error.message}).`;
    redirect(`/onboarding?error=${encodeURIComponent(message)}`);
  }

  // Tell the app the home page has changed, so it doesn't reuse an
  // old copy that still thinks you have no profile.
  revalidatePath("/", "layout");
  redirect("/");
}
