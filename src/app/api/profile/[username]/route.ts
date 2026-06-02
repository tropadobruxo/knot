import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPublicProfile } from "@/lib/profile";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const session = await auth();
  const profile = await getPublicProfile(username, session?.user?.id);

  if (!profile) {
    return NextResponse.json(
      { error: "Perfil não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json(profile);
}
