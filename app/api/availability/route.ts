import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COURSES } from "@/lib/courses";

type AvailabilityByCourse = Record<
  string,
  {
    remaining: number;
    choiceRemaining?: Record<string, number>;
  }
>;

export async function GET() {
  const paidBookings = await prisma.booking.findMany({
    where: { status: "paid" },
    select: {
      courseId: true,
      courseTitle: true,
      participants: true,
    },
  });

  const availability: AvailabilityByCourse = {};

  for (const course of COURSES) {
    const bookingsForCourse = paidBookings.filter(
      (booking) => booking.courseId === course.id,
    );

    const paidParticipants = bookingsForCourse.reduce(
      (sum, booking) => sum + booking.participants,
      0,
    );

    const courseAvailability: AvailabilityByCourse[string] = {
      remaining: Math.max(course.maxParticipants - paidParticipants, 0),
    };

    if (course.bookingChoices?.length) {
      const choiceRemaining: Record<string, number> = {};

      for (const choice of course.bookingChoices) {
        const choiceCapacity = choice.maxParticipants ?? course.maxParticipants;
        const paidForChoice = bookingsForCourse
          .filter((booking) => booking.courseTitle.includes(`(${choice.label})`))
          .reduce((sum, booking) => sum + booking.participants, 0);

        choiceRemaining[choice.id] = Math.max(choiceCapacity - paidForChoice, 0);
      }

      courseAvailability.choiceRemaining = choiceRemaining;
    }

    availability[course.id] = courseAvailability;
  }

  return NextResponse.json({ availability });
}
