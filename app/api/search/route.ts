import { NextResponse, type NextRequest } from "next/server";
import { searchSite } from "@/lib/site-search";

/** GET /api/search?q=bath+towel — a handful of matching pages, for the header search. */
export function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 80);
  return NextResponse.json({ results: q.trim().length >= 2 ? searchSite(q) : [] });
}
