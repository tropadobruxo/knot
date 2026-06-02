import webpush from "web-push";
import { prisma } from "@/lib/db";

let configured = false;

function ensureConfigured() {
  if (configured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL;

  if (!publicKey || !privateKey || !email) return false;

  webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
  configured = true;
  return true;
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Send push notification to all subscriptions of a user.
 * Non-blocking, catches errors gracefully.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!ensureConfigured()) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const promises = subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
      );
    } catch (err: unknown) {
      // Remove expired subscriptions (410 Gone)
      const wpErr = err as { statusCode?: number };
      if (wpErr.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      }
    }
  });

  await Promise.allSettled(promises);
}
