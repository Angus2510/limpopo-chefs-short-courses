const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const bookings = await prisma.booking.findMany({
    where: {
      status: {
        in: ["paid", "pending"],
      },
    },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    select: {
      firstName: true,
      lastName: true,
      email: true,
      courseTitle: true,
      campus: true,
      date: true,
      participants: true,
      amount: true,
      status: true,
      yocoPaymentId: true,
      yocoCheckoutId: true,
    },
  });

  const paid = bookings.filter((row) => row.status === "paid");
  const pending = bookings.filter((row) => row.status === "pending");

  const grouped = new Map();
  for (const row of bookings) {
    const key = `${row.courseTitle} | ${row.campus} | ${row.date}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        courseTitle: row.courseTitle,
        campus: row.campus,
        date: row.date,
        totalBookings: 0,
        totalParticipants: 0,
        paidBookings: 0,
        paidParticipants: 0,
        pendingBookings: 0,
        pendingParticipants: 0,
      });
    }
    const g = grouped.get(key);
    g.totalBookings += 1;
    g.totalParticipants += row.participants;
    if (row.status === "paid") {
      g.paidBookings += 1;
      g.paidParticipants += row.participants;
    }
    if (row.status === "pending") {
      g.pendingBookings += 1;
      g.pendingParticipants += row.participants;
    }
  }

  const paidParticipants = paid.reduce((sum, row) => sum + row.participants, 0);
  const pendingParticipants = pending.reduce(
    (sum, row) => sum + row.participants,
    0,
  );
  const totalParticipants = bookings.reduce(
    (sum, row) => sum + row.participants,
    0,
  );

  console.log("=== PAID ATTENDEES ===");
  console.log(JSON.stringify(paid, null, 2));
  console.log("=== PENDING ATTENDEES ===");
  console.log(JSON.stringify(pending, null, 2));
  console.log("=== ATTENDANCE SUMMARY (GROUPED) ===");
  console.log(JSON.stringify(Array.from(grouped.values()), null, 2));
  console.log("=== TOTALS ===");
  console.log(
    JSON.stringify(
      {
        totalBookings: bookings.length,
        totalParticipants,
        paidBookings: paid.length,
        paidParticipants,
        pendingBookings: pending.length,
        pendingParticipants,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
