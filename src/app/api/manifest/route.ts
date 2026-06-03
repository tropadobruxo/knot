import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const DEFAULT_MANIFEST = {
  name: "Knot",
  short_name: "Knot",
  description: "Conexão para a comunidade kink/fetichista adulta.",
  start_url: "/",
  display: "standalone",
  background_color: "#000000",
  theme_color: "#7c3aed",
  icons: [
    { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
  ],
};

const DISCREET_MANIFEST = {
  name: "Notes",
  short_name: "Notes",
  description: "Personal notes app.",
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#6b7280",
  icons: [
    { src: "/icon-discreet.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    { src: "/icon-discreet.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
  ],
};

export async function GET() {
  const session = await auth();

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { discreetMode: true },
    });

    if (user?.discreetMode) {
      return NextResponse.json(DISCREET_MANIFEST);
    }
  }

  return NextResponse.json(DEFAULT_MANIFEST);
}
