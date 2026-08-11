/**
 * Outbound transactional email for the auth flows (verification, password reset).
 *
 * THERE IS NO EMAIL PROVIDER WIRED UP YET, and that is a deliberate, visible
 * state rather than a gap. Both flows are fully implemented — token issue,
 * expiry, the pages that consume the link — and the only missing piece is the
 * transport that puts the link in front of the user.
 *
 * So this module has two modes:
 *
 *   CONFIGURED   RESEND_API_KEY + AUTH_EMAIL_FROM are set. Sends for real.
 *   UNCONFIGURED Logs the link to the server console.
 *
 * The unconfigured mode is what makes the flows testable today: sign up, look
 * at the terminal running `next dev`, click the printed link. It is NOT a
 * fallback that quietly does nothing — printing a password-reset link to a log
 * is only acceptable because the alternative is a silent no-op, which looks
 * identical to a working system right up until a real customer is locked out.
 * In production it therefore also emits an explicit error-level warning.
 *
 * Resend is called over plain fetch rather than through its SDK: it is one
 * POST, and an auth-critical path is a poor place to add a dependency that
 * exists to save four lines.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * True when a real transport is configured.
 *
 * lib/auth/index.ts reads this to decide whether to REQUIRE email verification
 * before sign-in. Requiring it with no way to send the email would lock every
 * new customer out of an account they just created.
 */
export function emailTransportConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.AUTH_EMAIL_FROM);
}

type AuthEmail = {
  to: string;
  subject: string;
  /** Plain-text body. The link is included separately so it can be logged. */
  body: string;
  /** The action URL — the whole point of the message. */
  url: string;
  /** Label for the button in the HTML version, e.g. "Verify email". */
  action: string;
};

export async function sendAuthEmail({ to, subject, body, url, action }: AuthEmail): Promise<void> {
  if (!emailTransportConfigured()) {
    logUnsentEmail({ to, subject, url, action });
    return;
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.AUTH_EMAIL_FROM,
      to: [to],
      subject,
      text: `${body}\n\n${url}\n`,
      html: renderHtml({ body, url, action }),
    }),
  });

  if (!res.ok) {
    // Surfaced, not swallowed. A failed verification send has to reach the
    // caller so the UI can say "we could not send it" instead of "check your
    // inbox" for a message that was never sent.
    const detail = await res.text().catch(() => "");
    throw new Error(`Email send failed (${res.status}): ${detail.slice(0, 300)}`);
  }
}

function logUnsentEmail({
  to,
  subject,
  url,
  action,
}: Pick<AuthEmail, "to" | "subject" | "url" | "action">) {
  const banner = [
    "",
    "─".repeat(72),
    `  EMAIL NOT SENT — no transport configured (${action})`,
    `  to:      ${to}`,
    `  subject: ${subject}`,
    `  link:    ${url}`,
    "─".repeat(72),
    "",
  ].join("\n");

  if (process.env.NODE_ENV === "production") {
    console.error(
      `${banner}\nSet RESEND_API_KEY and AUTH_EMAIL_FROM. Until then no customer ` +
        `can verify an address or reset a password without an administrator ` +
        `reading this log.`
    );
    return;
  }

  console.info(banner);
}

/**
 * Minimal branded HTML. Deliberately table-free and inline-styled — the brand
 * colours are hard-coded here because email clients cannot read our CSS
 * variables, so these five values are the one sanctioned duplication of the
 * palette outside globals.css.
 */
function renderHtml({ body, url, action }: Pick<AuthEmail, "body" | "url" | "action">) {
  const navy = "#0A2540";
  const ivory = "#FAF6EF";
  const blue = "#0b97ff";
  const gold = "#C9A84C";

  return `<div style="background:${ivory};padding:40px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-top:3px solid ${gold};padding:36px 32px">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${gold}">Souwel</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${navy}">${escapeHtml(body)}</p>
    <a href="${escapeHtml(url)}" style="display:inline-block;background:${blue};color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">${escapeHtml(action)}</a>
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:rgba(10,37,64,.6)">If the button does not work, paste this into your browser:<br><span style="word-break:break-all">${escapeHtml(url)}</span></p>
  </div>
</div>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
