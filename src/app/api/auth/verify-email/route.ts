import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/welcome?error=token_missing", request.url));
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    return NextResponse.redirect(new URL("/welcome?error=token_expired", request.url));
  }

  await prisma.$transaction([
    prisma.user.updateMany({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { token },
    }),
  ]);

  return NextResponse.redirect(new URL("/welcome?verified=true", request.url));
}
