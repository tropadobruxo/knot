import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { roundCoord } from "@/lib/profile";

const updateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  roleType: z.enum(["dom", "sub", "switch", "exploring"]).optional(),
  intent: z
    .array(z.enum(["relacionamento", "amizade", "aprender", "casual"]))
    .optional(),
  approxLat: z.number().min(-90).max(90).optional(),
  approxLng: z.number().min(-180).max(180).optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.bio !== undefined) data.bio = parsed.data.bio;
  if (parsed.data.city !== undefined) data.city = parsed.data.city;
  if (parsed.data.roleType !== undefined) data.roleType = parsed.data.roleType;
  if (parsed.data.intent !== undefined) data.intent = parsed.data.intent;
  if (parsed.data.approxLat !== undefined)
    data.approxLat = roundCoord(parsed.data.approxLat);
  if (parsed.data.approxLng !== undefined)
    data.approxLng = roundCoord(parsed.data.approxLng);

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, username: true },
  });

  return NextResponse.json({ user });
}
