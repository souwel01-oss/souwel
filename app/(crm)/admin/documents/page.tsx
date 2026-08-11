import type { Metadata } from "next";
import { FileText, Upload } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { listDocuments } from "@/lib/db/crm";
import { CrmPage, Panel, PanelHeader } from "@/components/crm/Surface";
import { FormAlert } from "@/components/auth/fields";

export const metadata: Metadata = {
  title: "Documents",
  robots: { index: false, follow: false },
};

/**
 * Documents.
 *
 * READ-ONLY, AND THE PAGE SAYS SO RATHER THAN SHOWING A BUTTON THAT CANNOT
 * WORK. Every document is a file in Cloudinary — the `Document` row holds a
 * `cloudinaryPublicId`, not the bytes — and CLOUDINARY_CLOUD_NAME,
 * CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are all still blank. An upload
 * control here would fail on the first file chosen, and a download link would
 * point at a host that has never heard of us.
 *
 * The table is real: the moment documents exist they appear, and the wiring
 * left is one signed-upload endpoint plus those three credentials.
 */
export default async function DocumentsPage() {
  await requireRole("/admin/documents", ["ADMIN", "SALES"]);

  const configured = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

  let documents: Awaited<ReturnType<typeof listDocuments>> = [];
  let loadFailed = false;
  try {
    documents = await listDocuments();
  } catch (error) {
    console.error("[crm] documents read failed:", error);
    loadFailed = true;
  }

  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <CrmPage className="grid gap-5">
      {!configured ? (
        <div data-crm-item>
          <FormAlert kind="error">
            File storage is not configured, so documents cannot be uploaded or downloaded yet. Set{" "}
            <code className="font-mono text-[12px]">CLOUDINARY_CLOUD_NAME</code>,{" "}
            <code className="font-mono text-[12px]">CLOUDINARY_API_KEY</code> and{" "}
            <code className="font-mono text-[12px]">CLOUDINARY_API_SECRET</code> in{" "}
            <code className="font-mono text-[12px]">.env.local</code>. The list below still shows
            anything already recorded.
          </FormAlert>
        </div>
      ) : null}

      <Panel>
        <PanelHeader
          title="Documents"
          description="Quotations, invoices, contracts and spec sheets attached to customers, quotes and orders."
          action={
            <button
              type="button"
              disabled
              title="Needs Cloudinary credentials"
              className="border-border text-muted-foreground inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border px-3.5 text-[12.5px] font-semibold opacity-60"
            >
              <Upload aria-hidden className="size-3.5" />
              Upload
            </button>
          }
        />

        {loadFailed ? (
          <div className="px-5 py-5">
            <FormAlert kind="error">
              We could not load the document list right now. Please reload in a moment.
            </FormAlert>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="border-premium/30 bg-premium/10 text-premium grid size-14 place-items-center rounded-full border">
              <FileText aria-hidden className="size-6" />
            </span>
            <h3 className="font-heading text-foreground mt-5 text-[1.05rem]">No documents yet</h3>
            <p className="text-muted-foreground mt-2 max-w-sm text-[13.5px] leading-relaxed">
              Once file storage is connected, quotations and invoices attached to a customer will
              be listed here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-border/60 border-b">
                <tr className="text-muted-foreground text-[11px] font-semibold tracking-[0.1em] uppercase">
                  <th scope="col" className="px-4 py-3">
                    File
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Customer
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Uploaded by
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id} className="border-border/40 border-b last:border-0">
                    <th scope="row" className="text-foreground px-4 py-3 text-[13.5px] font-medium">
                      {d.fileName}
                    </th>
                    <td className="text-muted-foreground px-4 py-3 text-[12.5px] tracking-[0.06em] uppercase">
                      {d.type.replace("_", " ")}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-[13px]">
                      {d.customerProfile?.companyName ?? "—"}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-[13px]">
                      {d.uploadedBy.name}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-right text-[13px] tabular-nums">
                      {dateFmt.format(d.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </CrmPage>
  );
}
