import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COURSES } from "@/lib/courses";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.YOCO_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            "Payment provider not configured. Add YOCO_SECRET_KEY to your environment variables.",
        },
        { status: 503 },
      );
    }

    const body = await req.json();
    const {
      courseId,
      courseTitle,
      campus,
      date,
      participants,
      pricePerPerson,
      bookingChoiceId,
      bookingChoiceLabel,
      firstName,
      lastName,
      email,
      phone,
    } = body;

    const participantsNumber = Number(participants);
    const pricePerPersonNumber = Number(pricePerPerson);

    const hasValidNumbers =
      Number.isFinite(participantsNumber) &&
      participantsNumber > 0 &&
      Number.isFinite(pricePerPersonNumber) &&
      pricePerPersonNumber > 0;

    if (
      !courseId ||
      !courseTitle ||
      !campus ||
      !date ||
      !hasValidNumbers ||
      !firstName ||
      !lastName ||
      !email ||
      !phone
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const course = COURSES.find((item) => item.id === String(courseId));
    if (!course) {
      return NextResponse.json({ error: "Invalid course" }, { status: 400 });
    }

    const normalizedChoiceId = bookingChoiceId ? String(bookingChoiceId) : null;
    const selectedChoice = normalizedChoiceId
      ? course.bookingChoices?.find(
          (choice) => choice.id === normalizedChoiceId,
        )
      : null;

    if (normalizedChoiceId && !selectedChoice) {
      return NextResponse.json(
        { error: "Invalid booking option" },
        { status: 400 },
      );
    }

    const capacity = selectedChoice?.maxParticipants ?? course.maxParticipants;
    const paidCount = await prisma.booking.aggregate({
      _sum: { participants: true },
      where: {
        courseId: String(courseId),
        campus: String(campus),
        status: "paid",
        ...(selectedChoice
          ? { courseTitle: { contains: `(${selectedChoice.label})` } }
          : {}),
      },
    });

    const alreadyPaid = paidCount._sum.participants ?? 0;
    const remaining = Math.max(capacity - alreadyPaid, 0);

    if (participantsNumber > remaining) {
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Only ${remaining} spot(s) left for this option.`
              : "This option is sold out.",
        },
        { status: 409 },
      );
    }

    const sanitizedCourseTitle = selectedChoice
      ? `${course.title} (${selectedChoice.label})`
      : course.title;

    const normalizedEmail = String(email).trim().toLowerCase();

    const amountInCents = Math.round(
      pricePerPersonNumber * participantsNumber * 100,
    );
    const requestReferenceId = randomUUID();
    const clientReferenceId = `${normalizedEmail}:${requestReferenceId}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    // Create Yoco Checkout session (server-side only — secret key never leaves the server)
    const yocoRes = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.YOCO_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": requestReferenceId,
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency: "ZAR",
        successUrl: `${baseUrl}/payment/success?ref=${encodeURIComponent(clientReferenceId)}`,
        cancelUrl: `${baseUrl}/payment/cancelled`,
        failureUrl: `${baseUrl}/payment/cancelled`,
        metadata: {
          courseId,
          courseTitle: sanitizedCourseTitle,
          campus,
          date,
          participants: String(participantsNumber),
          bookingChoiceId: bookingChoiceId ? String(bookingChoiceId) : "",
          bookingChoiceLabel: selectedChoice?.label ?? "",
          customerEmail: normalizedEmail,
          customerName: `${firstName} ${lastName}`,
          clientReferenceId,
        },
        lineItems: [
          {
            displayName: sanitizedCourseTitle,
            quantity: participantsNumber,
            pricingDetails: { price: Math.round(pricePerPersonNumber * 100) },
            description: `${campus} Campus · ${date}`,
          },
        ],
        clientReferenceId,
      }),
    });

    if (!yocoRes.ok) {
      const yocoError = await yocoRes.json().catch(() => ({}));
      console.error("[checkout] Yoco error:", yocoError);
      return NextResponse.json(
        { error: "Payment provider error. Please try again." },
        { status: 502 },
      );
    }

    const checkout = await yocoRes.json();

    // Save pending booking to the database
    await prisma.booking.create({
      data: {
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        email: normalizedEmail,
        phone: String(phone).trim(),
        courseId: String(courseId),
        courseTitle: sanitizedCourseTitle,
        campus: String(campus),
        date: String(date),
        participants: participantsNumber,
        amount: amountInCents,
        currency: "ZAR",
        status: "pending",
        yocoCheckoutId: checkout.id,
        clientReferenceId,
      },
    });

    return NextResponse.json({ redirectUrl: checkout.redirectUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[checkout] Error:", message);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? message
            : "Internal server error",
      },
      { status: 500 },
    );
  }
}
