import type { Metadata } from "next";
import { prisma } from "@/lib/db";

interface Props {
  params: Promise<{ eventId: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { title: true, description: true, city: true, type: true, datetime: true },
    });

    if (!event) return { title: "Evento não encontrado — Knot" };

    const description = event.description
      ? event.description.slice(0, 160)
      : `${event.type} em ${event.city}`;

    const dateStr = new Date(event.datetime).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return {
      title: `${event.title} — Knot`,
      description: `${description} — ${dateStr}`,
      openGraph: {
        title: event.title,
        description: `${description} — ${dateStr}`,
        type: "website",
      },
      twitter: {
        card: "summary",
        title: event.title,
        description: `${description} — ${dateStr}`,
      },
    };
  } catch {
    return { title: "Evento — Knot" };
  }
}

export default function EventLayout({ children }: Props) {
  return children;
}
