import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";
import { COURSES } from "@/lib/courses";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await context.params;
  const sessionToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidAdminSession(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const nextCourseId = String(body.courseId ?? "").trim();

  if (!nextCourseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  const nextCourse = COURSES.find((course) => course.id === nextCourseId);
  if (!nextCourse) {
    return NextResponse.json({ error: "Invalid course" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      courseId: nextCourse.id,
      courseTitle: nextCourse.title,
    },
    select: {
      id: true,
      courseId: true,
      courseTitle: true,
    },
  });

  return NextResponse.json({ booking: updatedBooking });
}
