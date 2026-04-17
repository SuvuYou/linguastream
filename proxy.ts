import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
