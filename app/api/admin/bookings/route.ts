import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidAdminSession(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      courseId: true,
      courseTitle: true,
      campus: true,
      status: true,
      email: true,
      phone: true,
      participants: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      bookings: bookings.map((booking) => ({
        id: booking.id,
        firstName: booking.firstName,
        firstname: booking.firstName,
        lastName: booking.lastName,
        bookedBy: `${booking.firstName ?? ""} ${booking.lastName ?? ""}`.trim(),
        courseId: booking.courseId,
        courseTitle: booking.courseTitle,
        campus: booking.campus,
        paid: booking.status === "paid",
        email: booking.email,
        phone: booking.phone,
        participants: booking.participants,
        createdAt: booking.createdAt,
      })),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}
