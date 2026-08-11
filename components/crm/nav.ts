import { FileSpreadsheet, FolderOpen, LayoutDashboard, Settings, Users } from "lucide-react";

/**
 * CRM navigation.
 *
 * All five routes exist. Documents and Settings are read-only for now — the
 * uploader needs Cloudinary credentials that are not configured — but they show
 * real data and say plainly what is missing, which is a different thing from a
 * link that 404s.
 */
export const CRM_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/leads", label: "Leads & Quotes", icon: FileSpreadsheet },
  { href: "/admin/documents", label: "Documents", icon: FolderOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;
