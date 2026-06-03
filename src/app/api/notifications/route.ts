import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type NotificationType = "new_match" | "new_message" | "event_reminder" | "like_received";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}

const PREVIEW_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "preview-1",
    type: "new_match",
    title: "Novo match!",
    description: "Voce e Luna fizeram match. Comece uma conversa!",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
  },
  {
    id: "preview-2",
    type: "new_message",
    title: "Nova mensagem",
    description: "Kai enviou uma mensagem: \"Oi, tudo bem?\"",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
  },
  {
    id: "preview-3",
    type: "event_reminder",
    title: "Evento amanha",
    description: "Munch SP acontece amanha as 19h. Nao esqueca!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: "preview-4",
    type: "like_received",
    title: "Alguem curtiu voce",
    description: "Uma pessoa curtiu seu perfil. Descubra quem!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
  {
    id: "preview-5",
    type: "new_match",
    title: "Novo match!",
    description: "Voce e Ariel fizeram match.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
  {
    id: "preview-6",
    type: "new_message",
    title: "Nova mensagem",
    description: "Sol enviou uma foto.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
  },
];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    // TODO: Replace with real DB query once Notification model exists
    // const notifications = await prisma.notification.findMany({
    //   where: { userId: session.user.id },
    //   orderBy: { createdAt: "desc" },
    // });

    return NextResponse.json({ notifications: PREVIEW_NOTIFICATIONS });
  } catch {
    // Fallback to preview data if auth or DB is not configured
    return NextResponse.json({ notifications: PREVIEW_NOTIFICATIONS });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const body = (await request.json()) as { markAllRead?: boolean; notificationId?: string };

    if (body.markAllRead) {
      // TODO: Replace with real DB update once Notification model exists
      // await prisma.notification.updateMany({
      //   where: { userId: session.user.id, read: false },
      //   data: { read: true },
      // });
      return NextResponse.json({ success: true });
    }

    if (body.notificationId) {
      // TODO: Replace with real DB update
      // await prisma.notification.update({
      //   where: { id: body.notificationId, userId: session.user.id },
      //   data: { read: true },
      // });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Requisicao invalida." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
