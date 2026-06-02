import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const interests = await prisma.interest.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(interests);
}
