// Finds bookings stuck on "pending" whose Yoco checkout actually completed
// (e.g. webhook delivery failed) and marks them "paid", sending the
// confirmation email. Safe to re-run; only touches bookings Yoco confirms
// as completed.
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function formatPrice(amount) {
  return `R ${Number(amount).toLocaleString("en-ZA")}`;
}

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Minimal plain-text confirmation, self-contained to avoid importing the
// TS lib (which uses "@/..." path aliases not resolvable from a plain script).
async function sendBookingConfirmation(booking) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.warn(
      "[reconcile] Missing RESEND_API_KEY or RESEND_FROM_EMAIL; confirmation email was not sent",
    );
    return;
  }

  const { Resend } = require("resend");
  const resend = new Resend(apiKey);
  const customerName = `${booking.firstName} ${booking.lastName}`.trim();

  const text = [
    `Hello ${customerName},`,
    "",
    "Your booking is confirmed.",
    `Course: ${booking.courseTitle}`,
    `Campus: ${booking.campus}`,
    `Date: ${formatDate(booking.date)}`,
    `Participants: ${booking.participants}`,
    `Total paid: ${formatPrice(booking.amount / 100)}`,
    `Booking reference: ${booking.id}`,
    "",
    "Limpopo Chefs Academy",
  ].join("\n");

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: booking.email,
      subject: "Your booking is confirmed",
      text,
    });

    if (error) {
      console.error("[reconcile] Resend error:", error);
      return;
    }

    console.log(`[reconcile] Sent confirmation for booking ${booking.id}`);
  } catch (error) {
    console.error("[reconcile] Failed to send email:", error.message);
  }
}

async function main() {
  const secret = process.env.YOCO_SECRET_KEY;
  if (!secret) {
    throw new Error("YOCO_SECRET_KEY is not configured");
  }

  const pendingBookings = await prisma.booking.findMany({
    where: { status: "pending", yocoCheckoutId: { not: null } },
  });

  const results = { checked: pendingBookings.length, updated: 0, stillPending: 0, errors: 0 };

  for (const booking of pendingBookings) {
    try {
      const res = await fetch(
        `https://payments.yoco.com/api/checkouts/${encodeURIComponent(booking.yocoCheckoutId)}`,
        {
          headers: { Authorization: `Bearer ${secret}` },
          cache: "no-store",
        },
      );
      const checkout = await res.json().catch(() => ({}));

      if (!res.ok) {
        results.errors += 1;
        continue;
      }

      if (checkout.status === "completed") {
        const updated = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: "paid",
            yocoPaymentId: checkout.paymentId ?? booking.yocoPaymentId,
          },
        });
        await sendBookingConfirmation(updated);
        results.updated += 1;
        console.log(`[reconcile] Marked paid: ${booking.id}`);
      } else if (checkout.status === "failed" || checkout.status === "cancelled") {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "failed" },
        });
        console.log(`[reconcile] Marked failed: ${booking.id} (yoco status: ${checkout.status})`);
      } else {
        results.stillPending += 1;
      }
    } catch (error) {
      results.errors += 1;
      console.error(`[reconcile] Error checking booking ${booking.id}:`, error.message);
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch((error) => {
    console.error("[reconcile] Fatal error:", error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
