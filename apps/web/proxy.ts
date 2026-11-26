import { NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/helpers/safe-next-path";
import { isGroupMocked } from "@/mocks/config";

export async function proxy(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

  const isMockSignedIn = isGroupMocked("user");

  if (!session && !isAuthPage && !isMockSignedIn) {
    const signIn = new URL("/auth/signin", req.url);
    if (req.nextUrl.pathname !== "/") {
      signIn.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    }
    return NextResponse.redirect(signIn);
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(
      new URL(safeNextPath(req.nextUrl.searchParams.get("next")), req.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
