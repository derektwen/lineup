import Link from "next/link";
import { sendSignInCode, verifySignInCode } from "./actions";

// The sign-in screen. No passwords: you type your email, Supabase emails you
// a short code, and you type the code here. Because you type it into this
// same screen, it works no matter which app or browser you read email in.
// This page depends on who is signed in, so it is built fresh for each visit
// instead of being pre-built ahead of time.
export const instant = false;

const inputClass =
  "h-12 rounded-xl border border-[#3A3A43] bg-[#17171C] px-4 text-base outline-none focus:border-[#C8F560]";
const buttonClass = "h-12 rounded-xl bg-[#C8F560] font-semibold text-[#0F0F12]";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { sent, error } = await searchParams;
  const email = typeof sent === "string" ? sent : undefined;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-bold tracking-tight">
        lineup<span className="text-[#C8F560]">.</span>
      </h1>

      {email ? (
        // Step 2: type the code from the email.
        <form action={verifySignInCode} className="flex flex-col gap-3">
          <input type="hidden" name="email" value={email} />
          <label htmlFor="code" className="text-[#C9C9CF]">
            We emailed a code to <strong className="text-[#F2F2F0]">{email}</strong>. Enter it here.
          </label>
          <input
            id="code"
            name="code"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6,10}"
            title="The number code from the email"
            placeholder="123456"
            className={`${inputClass} text-center text-2xl tracking-[0.3em]`}
          />
          <button type="submit" className={buttonClass}>
            Sign in
          </button>
          {error && <p className="text-sm text-[#FF8A8A]">{error}</p>}
          <Link href="/login" className="py-3 text-center text-sm text-[#9A9AA3] underline">
            Use a different email or resend the code
          </Link>
        </form>
      ) : (
        // Step 1: type your email.
        <form action={sendSignInCode} className="flex flex-col gap-3">
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
            className={inputClass}
          />
          <button type="submit" className={buttonClass}>
            Email me a code
          </button>
          {error && <p className="text-sm text-[#FF8A8A]">{error}</p>}
        </form>
      )}
    </main>
  );
}
