import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
      firstName,
      lastName,
      email,
      phone,
    } = body;

    if (
      !courseId ||
      !courseTitle ||
      !campus ||
      !date ||
      !participants ||
      !pricePerPerson ||
      !firstName ||
      !lastName ||
      !email
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const amountInCents = Math.round(
      Number(pricePerPerson) * Number(participants) * 100,
    );
    const clientReferenceId = randomUUID();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    // Create Yoco Checkout session (server-side only — secret key never leaves the server)
    const yocoRes = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.YOCO_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": clientReferenceId,
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency: "ZAR",
        successUrl: `${baseUrl}/payment/success?ref=${clientReferenceId}`,
        cancelUrl: `${baseUrl}/payment/cancelled`,
        failureUrl: `${baseUrl}/payment/cancelled`,
        metadata: {
          courseId,
          courseTitle,
          campus,
          date,
          participants: String(participants),
          customerEmail: email,
          customerName: `${firstName} ${lastName}`,
          clientReferenceId,
        },
        lineItems: [
          {
            displayName: courseTitle,
            quantity: Number(participants),
            pricingDetails: { price: Math.round(Number(pricePerPerson) * 100) },
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
        email: String(email).trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        courseId: String(courseId),
        courseTitle: String(courseTitle),
        campus: String(campus),
        date: String(date),
        participants: Number(participants),
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
