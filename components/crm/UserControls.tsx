"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { setUserActive, updateUserRole } from "@/app/(crm)/actions";
import { ASSIGNABLE_ROLES, roleLabel } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

/**
 * Role and account-status controls.
 *
 * `canManage` HIDES THE CONTROL; IT DOES NOT ENFORCE ANYTHING. The enforcement
 * is in app/(crm)/actions.ts, which re-checks for an Admin on every call. This
 * prop exists so a Sales user is not shown a dropdown that will refuse them —
 * an affordance that always fails is worse than no affordance.
 *
 * Both changes go through a confirmation step. Not ceremony: a role select is
 * one mis-click from making a customer an administrator, and the two controls
 * sit next to each other in a drawer that opens on a row click.
 */
export function UserControls({
  userId,
  role,
  active,
  isSelf,
  canManage,
}: {
  userId: string;
  role: string;
  active: boolean;
  isSelf: boolean;
  canManage: boolean;
}) {
  if (!canManage) {
    return (
      <div className="border-border bg-muted/40 rounded-xl border p-4">
        <p className="text-muted-foreground flex items-start gap-2 text-[12.5px] leading-relaxed">
          <ShieldAlert aria-hidden className="mt-px size-4 shrink-0" />
          Roles and account status can only be changed by an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="border-border bg-card grid gap-4 rounded-xl border p-4">
      {isSelf ? (
        <p className="text-muted-foreground flex items-start gap-2 text-[12.5px] leading-relaxed">
          <ShieldAlert aria-hidden className="mt-px size-4 shrink-0" />
          {/* Not a UI nicety — the server refuses this too. An admin who demotes
              or deactivates themselves locks the controls for everyone if they
              were the last one, and the only way back is raw SQL. */}
          This is your own account. Ask another administrator to change your role or status.
        </p>
      ) : (
        <>
          <RoleSelect userId={userId} role={role} />
          <ActiveToggle userId={userId} active={active} />
        </>
      )}
    </div>
  );
}

function RoleSelect({ userId, role }: { userId: string; role: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<string | null>(null);

  function apply(next: string) {
    startTransition(async () => {
      const result = await updateUserRole({ userId, role: next });
      setConfirming(null);
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="grid gap-2">
      <label htmlFor="role-select" className="text-foreground/80 text-[12.5px] font-semibold">
        Role
      </label>

      <select
        id="role-select"
        value={confirming ?? role}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          if (next === role) setConfirming(null);
          else setConfirming(next);
        }}
        className="border-input bg-card text-foreground focus-visible:border-primary focus-visible:ring-primary/25 h-10 rounded-lg border px-3 text-[13.5px] outline-none focus-visible:ring-4 disabled:opacity-60"
      >
        {ASSIGNABLE_ROLES.map((r) => (
          <option key={r} value={r}>
            {roleLabel(r)}
          </option>
        ))}
      </select>

      {confirming && confirming !== role ? (
        <div className="border-premium/40 bg-premium/10 grid gap-2.5 rounded-lg border p-3">
          <p className="text-foreground text-[12.5px] leading-relaxed">
            Change this account from <strong>{roleLabel(role)}</strong> to{" "}
            <strong>{roleLabel(confirming)}</strong>?
            {confirming === "ADMIN" ? " Administrators can change anyone's role." : null}
          </p>
          <div className="flex gap-2">
            <ConfirmButton pending={pending} onClick={() => apply(confirming)}>
              Yes, change role
            </ConfirmButton>
            <CancelButton disabled={pending} onClick={() => setConfirming(null)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ActiveToggle({ userId, active }: { userId: string; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function apply() {
    startTransition(async () => {
      const result = await setUserActive({ userId, active: !active });
      setConfirming(false);
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="grid gap-2">
      <span className="text-foreground/80 text-[12.5px] font-semibold">Account status</span>

      <div className="flex items-center gap-3">
        <StatusPill active={active} />
        <button
          type="button"
          onClick={() => setConfirming((v) => !v)}
          disabled={pending}
          className="border-border text-foreground hover:bg-muted focus-visible:ring-ring h-9 rounded-lg border px-3.5 text-[12.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
        >
          {active ? "Deactivate" : "Activate"}
        </button>
      </div>

      {confirming ? (
        <div className="border-premium/40 bg-premium/10 grid gap-2.5 rounded-lg border p-3">
          <p className="text-foreground text-[12.5px] leading-relaxed">
            {active
              ? // Said plainly because it is what actually happens — the action
                // deletes their sessions, so they are signed out immediately
                // rather than whenever their cookie happens to expire.
                "Deactivate this account? They will be signed out of every device straight away and will not be able to sign back in."
              : "Reactivate this account? They will be able to sign in again."}
          </p>
          <div className="flex gap-2">
            <ConfirmButton pending={pending} onClick={apply}>
              Yes, {active ? "deactivate" : "activate"}
            </ConfirmButton>
            <CancelButton disabled={pending} onClick={() => setConfirming(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap",
        active
          ? "border-forest/40 bg-forest/10 text-forest dark:text-[#87b06e]"
          : "border-destructive/40 bg-destructive/10 text-destructive"
      )}
    >
      {/* The dot is an addition to the word, never a replacement — a status
          column distinguished by hue alone is unreadable to a colour-blind
          reader. */}
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", active ? "bg-forest dark:bg-[#87b06e]" : "bg-destructive")}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function RolePill({ role }: { role: string }) {
  const tone =
    role === "ADMIN"
      ? "border-premium/50 bg-premium/12 text-premium"
      : role === "SALES"
        ? "border-primary/40 bg-primary/10 text-primary-strong dark:text-primary"
        : "border-border bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap",
        tone
      )}
    >
      {roleLabel(role)}
    </span>
  );
}

function ConfirmButton({
  pending,
  onClick,
  children,
}: {
  pending: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      className="bg-primary-strong text-primary-strong-foreground focus-visible:ring-ring inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[12.5px] font-semibold transition-[filter,transform] hover:brightness-110 active:translate-y-px focus-visible:ring-2 focus-visible:outline-none disabled:opacity-70"
    >
      {pending ? <Loader2 aria-hidden className="size-3.5 animate-spin" /> : null}
      {children}
    </button>
  );
}

function CancelButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-muted-foreground hover:text-foreground h-9 rounded-lg px-3 text-[12.5px] font-semibold disabled:opacity-60"
    >
      Cancel
    </button>
  );
}
