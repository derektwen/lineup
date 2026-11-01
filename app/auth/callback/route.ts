import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The link in the sign-in email lands here with a one-time code.
// We trade that code for a sign-in cookie, then send the person home.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/`);
    }
  }

  const message = "That sign-in link didn't work. It may have expired, or been opened in a different browser. Try again.";
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
}
