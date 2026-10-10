import { NextResponse, type NextRequest } from "next/server";
import { localizedUrl, pickLocale } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const locale = pickLocale(request.headers.get("accept-language"));
  return NextResponse.redirect(localizedUrl(request.url, locale));
}

export const config = {
  matcher: "/",
};
