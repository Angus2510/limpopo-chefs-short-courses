import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidAdminSession(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      courseTitle: true,
      status: true,
      email: true,
      phone: true,
      participants: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    bookings: bookings.map((booking) => ({
      id: booking.id,
      courseTitle: booking.courseTitle,
      paid: booking.status === "paid",
      email: booking.email,
      phone: booking.phone,
      participants: booking.participants,
      createdAt: booking.createdAt,
    })),
  });
}
