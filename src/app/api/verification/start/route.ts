import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getVerificationProvider } from "@/lib/verification";

export async function POST() {
  // Demo mode: skip auth when secrets are not configured
  if (!process.env["AUTH_SECRET"] && !process.env["NEXTAUTH_SECRET"]) {
    return NextResponse.json({ redirectUrl: "sandbox://demo-verified" });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const provider = getVerificationProvider();
  const { redirectUrl } = await provider.startVerification(session.user.id);

  return NextResponse.json({ redirectUrl });
}
