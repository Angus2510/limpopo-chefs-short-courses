const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const bookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      courseTitle: true,
      campus: true,
      status: true,
      email: true,
      phone: true,
      participants: true,
      createdAt: true,
    },
  });

  const mapped = bookings.map((booking) => ({
    id: booking.id,
    firstName: booking.firstName,
    lastName: booking.lastName,
    bookedBy: `${booking.firstName ?? ""} ${booking.lastName ?? ""}`.trim(),
    courseTitle: booking.courseTitle,
    campus: booking.campus,
    paid: booking.status === "paid",
    email: booking.email,
    phone: booking.phone,
    participants: booking.participants,
    createdAt: booking.createdAt,
  }));

  console.log(JSON.stringify(mapped, null, 2));
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
