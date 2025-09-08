// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // ✅ Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  // ✅ If not logged in, block admin pages
  if (!session && isAdminRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ If logged in, check role from profiles
  if (session && isAdminRoute) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (error || !profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url)); // 🚫 Kick non-admins to home
    }
  }

  return res;
}
