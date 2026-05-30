import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "default_super_secret_key_change_me_in_production";
const key = new TextEncoder().encode(secretKey);

const protectedRoutes = ["/", "/payroll", "/employees", "/logs"];
const publicRoutes = ["/login", "/signup"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // Read cookie
  const sessionCookie = req.cookies.get("session")?.value;
  let session = null;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, key, {
        algorithms: ["HS256"],
      });
      session = payload;
    } catch (error) {
      session = null;
    }
  }

  // Redirect to login if trying to access protected route without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect to dashboard if logged in and trying to access login/signup
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
