"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Step 1: someone submits their email. Supabase emails them a one-time code
// (and creates their account if this is their first time).
export async function sendSignInCode(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/login?sent=${encodeURIComponent(email)}`);
}

// Step 2: they type the code. If it matches, Supabase signs them in and
// the browser gets a sign-in cookie.
export async function verifySignInCode(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("code") ?? "").replace(/\s/g, "");

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });

  if (error) {
    const message = "That code didn't work. Check it and try again, or request a new one.";
    redirect(`/login?sent=${encodeURIComponent(email)}&error=${encodeURIComponent(message)}`);
  }
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
