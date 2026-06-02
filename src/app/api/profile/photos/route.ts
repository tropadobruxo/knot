import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const addPhotoSchema = z.object({
  url: z.string().url(),
  visibility: z.enum(["public", "afterMatch", "private"]).default("public"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = addPhotoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const count = await prisma.photo.count({
    where: { userId: session.user.id },
  });

  const photo = await prisma.photo.create({
    data: {
      userId: session.user.id,
      url: parsed.data.url,
      visibility: parsed.data.visibility,
      order: count,
    },
    select: { id: true, url: true, visibility: true, order: true },
  });

  return NextResponse.json(photo, { status: 201 });
}
