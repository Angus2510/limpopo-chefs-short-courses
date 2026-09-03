import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CAMPUSES, COURSES, type Campus } from "@/lib/courses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    const courseCampuses = CAMPUSES.filter((campus) =>
      course.campuses.includes(campus),
    );
    const campusRemaining = courseCampuses.reduce(
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
      // Summary for the campus selector; only campuses offering this course count.
      remaining: Math.max(...Object.values(campusRemaining), 0),
      campusRemaining,
    };

    if (course.bookingChoices?.length) {
      const choiceRemaining: Record<string, number> = {};
      const choiceCampusRemaining: Record<string, Record<Campus, number>> = {};

      for (const choice of course.bookingChoices) {
        const choiceCapacity = choice.maxParticipants ?? course.maxParticipants;
        const campusChoiceRemaining = courseCampuses.reduce(
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
        // Summary for the campus selector; only campuses offering this course count.
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
