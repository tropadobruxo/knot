import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createStorySchema = z.object({
  content: z.string().min(1).max(500),
  imageUrl: z.string().url().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const now = new Date();

  const stories = await prisma.story.findMany({
    where: { expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      imageUrl: true,
      createdAt: true,
      expiresAt: true,
      author: {
        select: { id: true, username: true, image: true },
      },
    },
  });

  // Group by author
  const grouped = new Map<string, { user: typeof stories[0]["author"]; stories: typeof stories }>();
  for (const s of stories) {
    const existing = grouped.get(s.author.id);
    if (existing) {
      existing.stories.push(s);
    } else {
      grouped.set(s.author.id, { user: s.author, stories: [s] });
    }
  }

  return NextResponse.json({
    storyGroups: Array.from(grouped.values()),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = createStorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now

  const story = await prisma.story.create({
    data: {
      authorId: session.user.id,
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl,
      expiresAt,
    },
    select: { id: true, content: true, createdAt: true, expiresAt: true },
  });

  return NextResponse.json(story, { status: 201 });
}
