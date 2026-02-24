import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // This is a simplified middleware - in production you'd verify the JWT
  // For now, we rely on client-side auth and API-level security
  return NextResponse.next();
}

export const config = {
  matcher: ["/protected/:path*"],
};
