// Runs before every request: keeps the login session fresh and sends
// signed-out visitors to the login page when they open a private page.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "@/lib/env";

const PRIVATE_PREFIXES = ["/dashboard", "/admin"];

export async function updateSession(request: NextRequest) {
  // If Supabase does not recognise the address a sign-in link asked for, it
  // falls back to the Site URL (usually "/") with the sign-in details
  // attached. Pass them to the right handler so the person still signs in.
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const code = params.get("code");
  const path = request.nextUrl.pathname;
  if (tokenHash && path !== "/auth/confirm") {
    const confirmUrl = request.nextUrl.clone();
    confirmUrl.pathname = "/auth/confirm";
    confirmUrl.search = new URLSearchParams({
      token_hash: tokenHash,
      type: params.get("type") ?? "email",
    }).toString();
    return NextResponse.redirect(confirmUrl);
  }
  if (code && path !== "/auth/callback") {
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

  const isPrivate = PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

  if (!user && isPrivate) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
