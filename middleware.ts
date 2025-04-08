import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "./db/schema";

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    console.log("Middleware processing path:", pathname);
    
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    console.log("Middleware token:", token ? "Authenticated" : "Not authenticated");
    if (token) {
      console.log("Authenticated user:", token.email, "Role:", token.role);
    }
    
    // Public paths that don't require authentication
    const publicPaths = ["/login", "/api/auth"];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    console.log("Is public path:", isPublicPath);
    
    // API routes should be handled separately
    if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
      // For API routes, return 401 if not authenticated
      if (!token) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      return NextResponse.next();
    }
    
    // If user is not logged in and trying to access protected path, redirect to login
    if (!token && !isPublicPath) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // If user is logged in and trying to access login page, redirect to home
    if (token && isPublicPath && !pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    
    // Admin paths that require BOSS role
    const adminPaths = ["/admin", "/users"];
    const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
    
    // If user doesn't have BOSS role and tries to access admin path, redirect to home
    if (token?.role !== UserRole.BOSS && isAdminPath) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    
    // Add the current path as a header
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // In case of error, allow the request to proceed
    // The application's error handling will take care of it
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}; 