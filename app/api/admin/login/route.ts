import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminSessionToken,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: getAdminSessionToken(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
