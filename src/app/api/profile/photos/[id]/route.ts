import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const updatePhotoSchema = z.object({
  visibility: z.enum(["public", "afterMatch", "private"]).optional(),
  order: z.number().int().min(0).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id } });

  if (!photo || photo.userId !== session.user.id) {
    return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });
  }

  const body: unknown = await request.json();
  const parsed = updatePhotoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.photo.update({
    where: { id },
    data: parsed.data,
    select: { id: true, url: true, visibility: true, order: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id } });

  if (!photo || photo.userId !== session.user.id) {
    return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });
  }

  await prisma.photo.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
