import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";
import { COURSES } from "@/lib/courses";

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

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidAdminSession(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const phone = body.phone ? String(body.phone).trim() : null;
  const courseId = String(body.courseId ?? "").trim();
  const campus = String(body.campus ?? "").trim();
  const date = String(body.date ?? "").trim();
  const bookingChoiceId = body.bookingChoiceId
    ? String(body.bookingChoiceId).trim()
    : null;
  const participants = Number(body.participants);
  const amountRand = Number(body.amount);

  if (
    !firstName ||
    !lastName ||
    !email ||
    !courseId ||
    !campus ||
    !Number.isFinite(participants) ||
    participants < 1 ||
    !Number.isFinite(amountRand) ||
    amountRand < 0
  ) {
    return NextResponse.json(
      { error: "Missing or invalid required fields" },
      { status: 400 },
    );
  }

  const course = COURSES.find((item) => item.id === courseId);
  if (!course) {
    return NextResponse.json({ error: "Invalid course" }, { status: 400 });
  }

  if (!course.campuses.includes(campus as (typeof course.campuses)[number])) {
    return NextResponse.json(
      { error: "Course is not offered at that campus" },
      { status: 400 },
    );
  }

  const selectedChoice = bookingChoiceId
    ? course.bookingChoices?.find((choice) => choice.id === bookingChoiceId)
    : null;

  if (bookingChoiceId && !selectedChoice) {
    return NextResponse.json(
      { error: "Invalid booking option" },
      { status: 400 },
    );
  }

  const courseTitle = selectedChoice
    ? `${course.title} (${selectedChoice.label})`
    : course.title;

  const booking = await prisma.booking.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      courseId: course.id,
      courseTitle,
      campus,
      date: date || course.availableDates[0] || "",
      participants,
      amount: Math.round(amountRand * 100),
      status: "paid",
      clientReferenceId: `manual:${email}:${Date.now()}`,
    },
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

  return NextResponse.json({
    booking: {
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
    },
  });
}
