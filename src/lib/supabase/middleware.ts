// Runs before every request: keeps the login session fresh and sends
// signed-out visitors to the login page when they open a private page.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "@/lib/env";

const PRIVATE_PREFIXES = ["/dashboard", "/admin"];

export async function updateSession(request: NextRequest) {
  // If Supabase does not recognise the address a sign-in link asked for, it
  // falls back to the Site URL (usually "/") with ?code=... attached. Send
  // that code to the callback so the person still ends up signed in.
  const code = request.nextUrl.searchParams.get("code");
  if (code && request.nextUrl.pathname !== "/auth/callback") {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    callbackUrl.search = `?code=${encodeURIComponent(code)}`;
    return NextResponse.redirect(callbackUrl);
  }

  let response = NextResponse.next({ request });
  const { url, publishableKey } = supabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPrivate = PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

  if (!user && isPrivate) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
