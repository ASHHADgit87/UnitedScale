import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessPath, isRole } from "@/lib/permissions";

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
