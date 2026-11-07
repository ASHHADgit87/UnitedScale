import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessPath, isRole } from "@/lib/permissions";
import {
  BOOTSTRAP_GRACE_MS,
  SESSION_COOKIE,
  SESSION_END_MESSAGES,
  SESSION_EXPIRES_HEADER,
  TOUCH_THROTTLE_MS,
  getSessionPolicy,
  type SessionEndReason,
} from "@/lib/session-policy";
import {
  decodeSessionState,
  encodeSessionState,
  evaluateSession,
  getSessionSecret,
  readSessionId,
  sessionCookieOptions,
} from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/signup"];
const PENDING_PATH = "/pending";

const matches = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

const json = (status: number, error: string, message: string) =>
  NextResponse.json({ success: false, error, message }, { status });

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new NextResponse("Server configuration error.", { status: 500 });
  }

  const sessionSecret = getSessionSecret();
  if (!sessionSecret) {
    return new NextResponse("Server configuration error.", { status: 500 });
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const user = data.user?.email_confirmed_at ? data.user : null;

  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api");
  const isPublic = PUBLIC_PATHS.some((path) => matches(pathname, path));
  const isPending = matches(pathname, PENDING_PATH);

  const redirect = (to: string, params?: Record<string, string>) => {
    const target = request.nextUrl.clone();
    target.pathname = to;
    target.search = "";
    Object.entries(params ?? {}).forEach(([key, value]) =>
      target.searchParams.set(key, value),
    );
    const redirected = NextResponse.redirect(target);
    response.cookies
      .getAll()
      .forEach((cookie) => redirected.cookies.set(cookie));
    return redirected;
  };

  if (!user) {
    if (isPublic) return response;
    if (isApi) return json(401, "UNAUTHENTICATED", "Please sign in.");
    return redirect("/login", { redirectTo: pathname });
  }

  const rawRole: unknown = user.app_metadata?.role;
  const role = isRole(rawRole) ? rawRole : null;
  const active = user.app_metadata?.status === "ACTIVE";

  const policy = getSessionPolicy(role);
  const now = Date.now();

  const { data: sessionData } = await supabase.auth.getSession();
  const sessionId =
    readSessionId(sessionData.session?.access_token) ??
    `${user.id}:${user.last_sign_in_at ?? ""}`;

  const stored = await decodeSessionState(
    request.cookies.get(SESSION_COOKIE)?.value,
    sessionSecret,
  );

  const current = stored?.sid === sessionId ? stored : null;

  const signedInAt = user.last_sign_in_at
    ? Date.parse(user.last_sign_in_at)
    : Number.NaN;
  const freshLogin =
    Number.isNaN(signedInAt) || now - signedInAt <= BOOTSTRAP_GRACE_MS;

  let endReason: SessionEndReason | null = null;
  if (current) endReason = evaluateSession(current, policy, now);
  else if (!freshLogin) endReason = "invalid";

  if (endReason) {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {}

    request.cookies
      .getAll()
      .filter((cookie) => cookie.name.startsWith("sb-"))
      .forEach((cookie) => response.cookies.delete(cookie.name));
    response.cookies.delete(SESSION_COOKIE);

    if (isApi) {
      const expired = json(
        401,
        `SESSION_${endReason.toUpperCase()}`,
        SESSION_END_MESSAGES[endReason],
      );
      response.cookies
        .getAll()
        .forEach((cookie) => expired.cookies.set(cookie));
      return expired;
    }

    const params: Record<string, string> = { reason: endReason };
    if (!isPublic && !isPending) params.redirectTo = pathname;
    return redirect("/login", params);
  }

  const isPrefetch =
    request.headers.has("next-router-prefetch") ||
    request.headers.get("purpose") === "prefetch";
  const base = current ?? { sid: sessionId, start: now, last: now };

  if (!current || (now - base.last >= TOUCH_THROTTLE_MS && !isPrefetch)) {
    response.cookies.set(
      SESSION_COOKIE,
      await encodeSessionState({ ...base, last: now }, sessionSecret),
      sessionCookieOptions(policy.maxMs),
    );
  }

  response.headers.set(
    SESSION_EXPIRES_HEADER,
    String(base.start + policy.maxMs),
  );

  if (role === null || !active) {
    if (isPending) return response;
    if (isApi)
      return json(403, "ACCOUNT_NOT_ACTIVE", "Your account is not active.");
    return redirect(PENDING_PATH);
  }

  if (isPublic) return redirect("/");
  if (!isApi && !canAccessPath(role, pathname))
    return redirect("/", { denied: "1" });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
