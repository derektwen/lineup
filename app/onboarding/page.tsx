import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createProfile } from "./actions";

// First-time setup: pick the name and username your friends will see.
// This page depends on who is signed in, so it is built fresh for each visit
// instead of being pre-built ahead of time.
export const instant = false;

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  // Already set up? Skip straight to the home screen.
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.claims.sub)
    .maybeSingle();
  if (existing) redirect("/");

  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to lineup</h1>
        <p className="mt-2 text-[#C9C9CF]">This is how your friends will find you.</p>
      </div>
      <form action={createProfile} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="display_name" className="text-sm text-[#C9C9CF]">Your name</label>
          <input
            id="display_name"
            name="display_name"
            required
            maxLength={40}
            placeholder="Derek"
            className="h-12 rounded-xl border border-[#3A3A43] bg-[#17171C] px-4 text-base outline-none focus:border-[#C8F560]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-sm text-[#C9C9CF]">Username</label>
          <input
            id="username"
            name="username"
            required
            pattern="[a-z0-9_]{3,20}"
            title="3 to 20 lowercase letters, numbers or underscores"
            placeholder="derek"
            autoCapitalize="none"
            className="h-12 rounded-xl border border-[#3A3A43] bg-[#17171C] px-4 text-base outline-none focus:border-[#C8F560]"
          />
          <p className="text-xs text-[#8A8A93]">Lowercase letters, numbers and _ only.</p>
        </div>
        <button type="submit" className="h-12 rounded-xl bg-[#C8F560] font-semibold text-[#0F0F12]">
          Continue
        </button>
        {error && <p className="text-sm text-[#FF8A8A]">{error}</p>}
      </form>
    </main>
  );
}
