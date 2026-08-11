import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { enabledSocialProviders } from "@/lib/auth";
import { getSessionUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);

  if (await getSessionUser()) redirect(next);

  return <RegisterForm providers={enabledSocialProviders} next={next} />;
}
