import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type") ?? "profiles";

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const take = 20;

  if (type === "profiles") {
    const users = await prisma.user.findMany({
      where: {
        status: "active",
        ageVerified: true,
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { bio: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ],
      },
      take,
      select: { id: true, username: true, bio: true, city: true, roleType: true },
    });
    return NextResponse.json({ results: users });
  }

  if (type === "groups") {
    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take,
      select: { id: true, name: true, description: true, city: true },
    });
    return NextResponse.json({ results: groups });
  }

  if (type === "events") {
    const events = await prisma.event.findMany({
      where: {
        datetime: { gte: new Date() },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ],
      },
      take,
      orderBy: { datetime: "asc" },
      select: { id: true, title: true, city: true, type: true, datetime: true },
    });
    return NextResponse.json({ results: events });
  }

  return NextResponse.json({ results: [] });
}
