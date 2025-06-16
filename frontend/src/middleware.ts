import { NextRequest, NextResponse } from "next/server"

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const is_admin = req.cookies.get("is_admin")?.value

  switch (is_admin) {
    case "False": {
      if (!path.startsWith("/admin") && path !== "/login" && path !== "/register")
        return NextResponse.next()
      return NextResponse.redirect(new URL("/", req.nextUrl))  
    }
    case "True": {
      if (path.startsWith("/admin"))
        return NextResponse.next()
      return NextResponse.redirect(new URL("/admin/tests", req.nextUrl))  
    }
    default: {
      if (path === "/login" || path === "/register")
        return NextResponse.next()
      return NextResponse.redirect(new URL("/login", req.nextUrl))  
    }
  }
}
 
// Пути, на которых не работает middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
