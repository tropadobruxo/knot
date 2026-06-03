import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { conversationId } = await params;
  const userId = session.user.id;

  // Verify participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { match: { select: { userAId: true, userBId: true } } },
  });

  if (!conversation) {
    return new Response("Not found", { status: 404 });
  }

  if (
    conversation.match.userAId !== userId &&
    conversation.match.userBId !== userId
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  let lastSeen = new Date(0);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Poll for new messages every 2 seconds, up to 55 seconds (Vercel limit)
      const maxDuration = 55_000;
      const pollInterval = 2_000;
      const startTime = Date.now();

      const poll = async () => {
        if (request.signal.aborted) {
          controller.close();
          return;
        }

        if (Date.now() - startTime > maxDuration) {
          sendEvent(JSON.stringify({ type: "reconnect" }));
          controller.close();
          return;
        }

        try {
          const messages = await prisma.message.findMany({
            where: {
              conversationId,
              createdAt: { gt: lastSeen },
            },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true,
              sender: { select: { username: true } },
              reactions: { select: { emoji: true, userId: true } },
            },
          });

          if (messages.length > 0) {
            lastSeen = messages[messages.length - 1]!.createdAt;
            const formatted = messages.map((m) => {
              const grouped = new Map<string, string[]>();
              for (const r of m.reactions) {
                const arr = grouped.get(r.emoji) ?? [];
                arr.push(r.userId);
                grouped.set(r.emoji, arr);
              }
              return {
                ...m,
                reactions: Array.from(grouped.entries()).map(([emoji, userIds]) => ({
                  emoji,
                  count: userIds.length,
                  userIds,
                })),
              };
            });
            sendEvent(JSON.stringify({ type: "messages", messages: formatted }));
          }
        } catch {
          // DB error — close gracefully
          controller.close();
          return;
        }

        setTimeout(poll, pollInterval);
      };

      // Send initial heartbeat
      sendEvent(JSON.stringify({ type: "connected" }));
      await poll();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
