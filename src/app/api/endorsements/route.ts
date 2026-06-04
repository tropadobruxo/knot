import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const VALID_TAGS = ["respectful", "communicative", "punctual", "safe", "fun"];

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId obrigatorio." }, { status: 400 });
  }

  const endorsements = await prisma.endorsement.groupBy({
    by: ["tag"],
    where: { receiverId: userId },
    _count: { tag: true },
    orderBy: { _count: { tag: "desc" } },
  });

  return NextResponse.json({
    endorsements: endorsements.map((e) => ({ tag: e.tag, count: e._count.tag })),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as { receiverId?: string; tag?: string };

  if (!body.receiverId || !body.tag || !VALID_TAGS.includes(body.tag)) {
    return NextResponse.json({ error: "receiverId e tag valida obrigatorios." }, { status: 400 });
  }

  if (body.receiverId === session.user.id) {
    return NextResponse.json({ error: "Nao pode endorsar a si mesmo." }, { status: 400 });
  }

  // Verify they have/had a match
  const match = await prisma.match.findFirst({
    where: {
      OR: [
        { userAId: session.user.id, userBId: body.receiverId },
        { userAId: body.receiverId, userBId: session.user.id },
      ],
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Voce so pode endorsar alguem com quem deu match." }, { status: 403 });
  }

  await prisma.endorsement.upsert({
    where: {
      giverId_receiverId_tag: {
        giverId: session.user.id,
        receiverId: body.receiverId,
        tag: body.tag,
      },
    },
    create: { giverId: session.user.id, receiverId: body.receiverId, tag: body.tag },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
