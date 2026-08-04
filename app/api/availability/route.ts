import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CAMPUSES, COURSES, type Campus } from "@/lib/courses";

type AvailabilityByCourse = Record<
  string,
  {
    remaining: number;
    campusRemaining?: Record<Campus, number>;
    choiceRemaining?: Record<string, number>;
    choiceCampusRemaining?: Record<string, Record<Campus, number>>;
  }
>;

export async function GET() {
  const paidBookings = await prisma.booking.findMany({
    where: { status: "paid" },
    select: {
      courseId: true,
      courseTitle: true,
      campus: true,
      participants: true,
    },
  });

  const availability: AvailabilityByCourse = {};

  for (const course of COURSES) {
    const bookingsForCourse = paidBookings.filter(
      (booking) => booking.courseId === course.id,
    );

    const campusRemaining = CAMPUSES.reduce(
      (acc, campus) => {
        const paidForCampus = bookingsForCourse
          .filter((booking) => booking.campus === campus)
          .reduce((sum, booking) => sum + booking.participants, 0);

        acc[campus] = Math.max(course.maxParticipants - paidForCampus, 0);
        return acc;
      },
      {} as Record<Campus, number>,
    );

    const courseAvailability: AvailabilityByCourse[string] = {
      // Backward-compatible summary: best remaining across campuses.
      remaining: Math.max(...Object.values(campusRemaining), 0),
      campusRemaining,
    };

    if (course.bookingChoices?.length) {
      const choiceRemaining: Record<string, number> = {};
      const choiceCampusRemaining: Record<string, Record<Campus, number>> = {};

      for (const choice of course.bookingChoices) {
        const choiceCapacity = choice.maxParticipants ?? course.maxParticipants;
        const campusChoiceRemaining = CAMPUSES.reduce(
          (acc, campus) => {
            const paidForCampusChoice = bookingsForCourse
              .filter(
                (booking) =>
                  booking.campus === campus &&
                  booking.courseTitle.includes(`(${choice.label})`),
              )
              .reduce((sum, booking) => sum + booking.participants, 0);

            acc[campus] = Math.max(choiceCapacity - paidForCampusChoice, 0);
            return acc;
          },
          {} as Record<Campus, number>,
        );

        choiceCampusRemaining[choice.id] = campusChoiceRemaining;
        // Backward-compatible summary: best remaining across campuses.
        choiceRemaining[choice.id] = Math.max(
          ...Object.values(campusChoiceRemaining),
          0,
        );
      }

      courseAvailability.choiceRemaining = choiceRemaining;
      courseAvailability.choiceCampusRemaining = choiceCampusRemaining;
    }

    availability[course.id] = courseAvailability;
  }

  return NextResponse.json({ availability });
}
