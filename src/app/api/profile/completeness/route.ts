import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export interface CompletenessResult {
  percentage: number;
  items: { key: string; label: string; done: boolean; href: string }[];
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      bio: true,
      city: true,
      roleType: true,
      intent: true,
      photos: { select: { id: true }, take: 1 },
      interests: { select: { id: true }, take: 1 },
      limits: { select: { id: true }, take: 1 },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const items = [
    { key: "bio", label: "Adicionar bio", done: !!user.bio, href: "/profile/edit" },
    { key: "city", label: "Definir cidade", done: !!user.city, href: "/profile/edit" },
    { key: "role", label: "Escolher papel", done: !!user.roleType, href: "/profile/edit" },
    { key: "intent", label: "Definir o que busca", done: user.intent.length > 0, href: "/profile/edit" },
    { key: "photo", label: "Adicionar foto", done: user.photos.length > 0, href: "/profile/edit/photos" },
    { key: "interests", label: "Adicionar interesses", done: user.interests.length > 0, href: "/profile/edit/interests" },
    { key: "limits", label: "Definir limites", done: user.limits.length > 0, href: "/profile/edit/limits" },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const percentage = Math.round((doneCount / items.length) * 100);

  return NextResponse.json({ percentage, items });
}
