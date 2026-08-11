import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/db/portal";
import { AccountForm } from "@/components/portal/AccountForm";
import { Card, CardHeader, PortalPage } from "@/components/portal/Surface";
import { FormAlert } from "@/components/auth/fields";

export const metadata: Metadata = {
  title: "Manage My Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await requireUser("/dashboard/account");

  /**
   * A failed profile read is shown, not thrown.
   *
   * Throwing here hands the whole page to the error boundary, so a database
   * blip takes out the navigation and the sign-out control along with the
   * form. The account holder can still leave, still switch pages, and is told
   * plainly what is missing.
   */
  let profile = null;
  let loadFailed = false;
  try {
    profile = await getProfile(user.id);
  } catch (error) {
    console.error("[portal] profile read failed:", error);
    loadFailed = true;
  }

  return (
    <PortalPage>
      <Card>
        <CardHeader
          title="Account details"
          description="Used on your quotations, orders and delivery paperwork."
        />

        {loadFailed ? (
          <div className="px-5 py-5 sm:px-6">
            <FormAlert kind="error">
              We could not load your saved details right now. Reload the page in a moment — nothing
              has been lost.
            </FormAlert>
          </div>
        ) : (
          <AccountForm
            email={user.email}
            initial={{
              name: user.name,
              companyName: profile?.companyName ?? "",
              phone: profile?.phone ?? "",
              addressLine1: profile?.addressLine1 ?? "",
              city: profile?.city ?? "",
              country: profile?.country ?? "",
            }}
          />
        )}
      </Card>
    </PortalPage>
  );
}
