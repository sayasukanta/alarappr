import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req as any;
  const isLoggedIn = !!session;
  const isProfilePage = nextUrl.pathname === "/profil";
  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname === "/register" ||
    nextUrl.pathname.startsWith("/register/complete-profile");

  const isPublicPage =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/verify") ||
    nextUrl.pathname.startsWith("/images/") ||
    nextUrl.pathname.endsWith(".png") ||
    nextUrl.pathname.endsWith(".jpg") ||
    nextUrl.pathname.endsWith(".jpeg") ||
    nextUrl.pathname.endsWith(".svg") ||
    nextUrl.pathname.endsWith(".ico") ||
    isAuthPage;

  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isLoggedIn) {
    const role = (session as any)?.user?.role;
    const isProfileComplete = (session as any)?.user?.isProfileComplete;

    // Rule: Hanya PESERTA yang diarahkan ke /profil jika NIK / nomor telepon NULL
    if (role === "PESERTA" && isProfileComplete === false && !isProfilePage) {
      return NextResponse.redirect(new URL("/profil", nextUrl));
    }

    // Role-based protection: Selain ADMIN tidak boleh mengakses /admin/*
    if (role !== "ADMIN" && nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    // Role-based dashboard redirect: Jika akses /dashboard langsung, arahkan sesuai role
    if (nextUrl.pathname === "/dashboard") {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
      }
      if (role === "INSTRUCTOR") {
        return NextResponse.redirect(new URL("/instructor/dashboard", nextUrl));
      }
      if (role === "SPONSOR") {
        return NextResponse.redirect(new URL("/sponsor/dashboard", nextUrl));
      }
    }

    if (isAuthPage) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
      } else if (role === "INSTRUCTOR") {
        return NextResponse.redirect(new URL("/instructor/dashboard", nextUrl));
      } else if (role === "SPONSOR") {
        return NextResponse.redirect(new URL("/sponsor/dashboard", nextUrl));
      }
      if (isProfileComplete === false) {
        return NextResponse.redirect(new URL("/profil", nextUrl));
      }
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|uploads).*)"],
};
