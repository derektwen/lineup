import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";

// The home page. It checks three things in order:
//   1. Are you signed in? If not, go to the sign-in screen.
//   2. Have you set up your profile? If not, go to onboarding.
//   3. Otherwise, show your home screen (the friends feed comes next).
// This page depends on who is signed in, so it is built fresh for each visit
// instead of being pre-built ahead of time.
export const instant = false;

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) redirect("/onboarding");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          lineup<span className="text-[#C8F560]">.</span>
        </h1>
        <form action={signOut}>
          <button type="submit" className="h-11 rounded-full border border-[#3A3A43] px-4 text-sm text-[#C9C9CF]">
            Sign out
          </button>
        </form>
      </header>
      <section className="rounded-2xl border border-[#26262D] bg-[#17171C] p-5">
        <p className="text-lg font-semibold">Hey {profile.display_name}</p>
        <p className="mt-1 text-[#C9C9CF]">
          You&apos;re signed in as <strong>@{profile.username}</strong>. Your friends feed will live here.
        </p>
      </section>
    </main>
  );
}
