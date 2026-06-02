import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PATHS = [
  "/welcome",
  "/verify",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/verification",
  "/api/uploadthing",
  "/api/stripe/webhook",
  "/manifest.json",
  "/_next",
  "/favicon.ico",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Preview mode: skip auth when secrets are not configured
  if (!process.env["AUTH_SECRET"] && !process.env["NEXTAUTH_SECRET"]) {
    return NextResponse.next();
  }

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/welcome", request.url));
  }

  if (!session.user.ageVerified) {
    return NextResponse.redirect(new URL("/verify", request.url));
  }

  // Block banned users
  const token = session as unknown as { user?: { status?: string } };
  if (token.user?.status === "banned") {
    return NextResponse.redirect(new URL("/welcome?banned=true", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
