import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getVerificationProvider } from "@/lib/verification";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const provider = getVerificationProvider();
  const { redirectUrl } = await provider.startVerification(session.user.id);

  return NextResponse.json({ redirectUrl });
}
