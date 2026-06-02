import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const DEFAULT_FROM = "Knot <noreply@knot.app>";

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping email");
    return false;
  }

  const from = process.env.EMAIL_FROM ?? DEFAULT_FROM;

  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error("[email] Failed to send:", error);
    return false;
  }
  return true;
}
