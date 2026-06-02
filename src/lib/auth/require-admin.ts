import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ADMIN_ROLES = ["admin", "moderator"];

/**
 * Guard for admin/moderator-only routes.
 * Returns the session on success, or a NextResponse error on failure.
 */
export async function requireAdmin(): Promise<
  | { session: { user: { id: string; role: string; email: string; username: string } } }
  | { error: NextResponse }
> {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  }

  if (!ADMIN_ROLES.includes(session.user.role)) {
    return { error: NextResponse.json({ error: "Não autorizado." }, { status: 403 }) };
  }

  return { session };
}
