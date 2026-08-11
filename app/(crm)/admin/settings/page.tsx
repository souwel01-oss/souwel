import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/roles";
import { CrmPage, Panel, PanelHeader } from "@/components/crm/Surface";
import { RolePill } from "@/components/crm/UserControls";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

/**
 * Settings.
 *
 * WHAT THIS IS: a truthful readout of which integrations are configured, and
 * what this account is allowed to do.
 *
 * WHAT IT IS NOT: a form. There is nothing here to edit — every value below
 * lives in an environment variable, which is deliberate. A production secret
 * that can be changed from a web page is a secret that can be changed by
 * anyone who gets one admin session, and it stops matching what is in the
 * deployment's own configuration.
 *
 * It earns its place because "why is the Google button missing" and "why did
 * my customer never get a verification email" are the two questions this
 * project will generate, and both are answered by looking at this page rather
 * than by asking a developer to read a log.
 *
 * ONLY THE BOOLEAN IS EVER RENDERED. No value, no prefix, no last-four — a
 * secret that reaches the browser has left the server, and "just the first few
 * characters" of an API key is still a leak.
 */
export default async function SettingsPage() {
  const staff = await requireRole("/admin/settings", ["ADMIN", "SALES"]);

  const integrations = [
    {
      name: "Database",
      detail: "PostgreSQL via Prisma. Everything in the CRM reads from here.",
      ready: Boolean(process.env.DATABASE_URL),
      vars: ["DATABASE_URL", "DIRECT_URL"],
    },
    {
      name: "Google sign-in",
      detail: "When unset, the “Continue with Google” button is not rendered at all.",
      ready: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      vars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    },
    {
      name: "Apple sign-in",
      detail:
        "The secret is a JWT you sign from a .p8 key and Apple expires it after six months.",
      ready: Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET),
      vars: ["APPLE_CLIENT_ID", "APPLE_CLIENT_SECRET"],
    },
    {
      name: "Transactional email",
      detail:
        "Without it, verification and password-reset links are printed to the server log instead of sent — and email verification is not enforced, so new customers are not locked out.",
      ready: Boolean(process.env.RESEND_API_KEY && process.env.AUTH_EMAIL_FROM),
      vars: ["RESEND_API_KEY", "AUTH_EMAIL_FROM"],
    },
    {
      name: "File storage",
      detail: "Cloudinary. Document upload and download stay disabled until this is set.",
      ready: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET),
      vars: ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
    },
  ];

  const admin = isAdmin(staff.role);

  const permissions = [
    { label: "View users, leads, quotes and orders", sales: true, admin: true },
    { label: "Change a quote or lead status", sales: true, admin: true },
    { label: "Export users and leads to Excel", sales: true, admin: true },
    { label: "Change a user's role", sales: false, admin: true },
    { label: "Activate or deactivate an account", sales: false, admin: true },
  ];

  return (
    <CrmPage className="grid gap-5">
      <Panel>
        <PanelHeader
          title="Your access"
          description="What this account can do in the CRM."
        />
        <div className="grid gap-5 px-5 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-foreground text-[14px] font-semibold">{staff.name}</span>
            <RolePill role={staff.role} />
            <span className="text-muted-foreground text-[13px]">{staff.email}</span>
          </div>

          <ul className="grid gap-2">
            {permissions.map((p) => {
              const allowed = admin ? p.admin : p.sales;
              return (
                <li key={p.label} className="flex items-center gap-2.5 text-[13px]">
                  {/* An icon plus a muted label, not a green tick against a red
                      cross — the state has to survive being read by someone who
                      cannot separate the two hues. */}
                  {allowed ? (
                    <Check aria-hidden className="text-forest size-4 shrink-0 dark:text-[#87b06e]" />
                  ) : (
                    <Minus aria-hidden className="text-muted-foreground/60 size-4 shrink-0" />
                  )}
                  <span className={allowed ? "text-foreground" : "text-muted-foreground/70"}>
                    {p.label}
                  </span>
                  {!allowed ? (
                    <span className="text-muted-foreground/60 ml-auto text-[11.5px]">
                      Admin only
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <p className="text-muted-foreground text-[12.5px] leading-relaxed">
            Roles are changed from the Users page by an administrator. Every one of these
            permissions is enforced on the server, not by hiding the control.
          </p>
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Integrations"
          description="Read from the server's environment. Values are never shown — only whether they are set."
        />
        <ul className="divide-border/50 divide-y">
          {integrations.map((i) => (
            <li key={i.name} className="flex flex-wrap items-start gap-3 px-5 py-4">
              <span
                className={cn(
                  "mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold",
                  i.ready
                    ? "border-forest/40 bg-forest/10 text-forest dark:text-[#87b06e]"
                    : "border-premium/40 bg-premium/10 text-premium"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 rounded-full",
                    i.ready ? "bg-forest dark:bg-[#87b06e]" : "bg-premium"
                  )}
                />
                {i.ready ? "Configured" : "Not set"}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-foreground text-[13.5px] font-semibold">{i.name}</p>
                <p className="text-muted-foreground mt-0.5 text-[12.5px] leading-relaxed">
                  {i.detail}
                </p>
                <p className="text-muted-foreground/70 mt-1.5 font-mono text-[11.5px]">
                  {i.vars.join(" · ")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </CrmPage>
  );
}
