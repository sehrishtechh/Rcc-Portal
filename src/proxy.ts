import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  const environment = getSupabaseEnvironment();
  if (!environment) {
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(environment.url, environment.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/projects/:path*",
    "/inspections/:path*",
    "/reports/:path*",
    "/qa/:path*",
    "/approvals/:path*",
    "/design/:path*",
    "/drafting/:path*",
    "/tasks/:path*",
    "/employees/:path*",
    "/employee-approvals/:path*",
    "/notifications/:path*",
    "/documents/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/pending-approval",
    "/account-rejected",
    "/account-suspended",
    "/unauthorized",
  ],
};
