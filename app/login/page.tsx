import { sendSignInLink } from "./actions";

// The sign-in screen. No passwords: you type your email, Supabase emails you
// a link, and tapping it signs you in.
// This page depends on who is signed in, so it is built fresh for each visit
// instead of being pre-built ahead of time.
export const instant = false;

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { sent, error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-bold tracking-tight">
        lineup<span className="text-[#C8F560]">.</span>
      </h1>

      {sent ? (
        <div className="rounded-2xl border border-[#26262D] bg-[#17171C] p-5">
          <p className="text-lg font-semibold">Check your email</p>
          <p className="mt-1 text-[#C9C9CF]">
            We sent a sign-in link to <strong>{sent}</strong>. Open it on this
            device to sign in.
          </p>
        </div>
      ) : (
        <form action={sendSignInLink} className="flex flex-col gap-3">
          <label htmlFor="email" className="text-[#C9C9CF]">
            Sign in or create an account
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            className="h-12 rounded-xl border border-[#3A3A43] bg-[#17171C] px-4 text-base outline-none focus:border-[#C8F560]"
          />
          <button
            type="submit"
            className="h-12 rounded-xl bg-[#C8F560] font-semibold text-[#0F0F12]"
          >
            Email me a sign-in link
          </button>
          {error && <p className="text-sm text-[#FF8A8A]">{error}</p>}
        </form>
      )}
    </main>
  );
}
