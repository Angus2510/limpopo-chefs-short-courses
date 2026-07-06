import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, ChefHat, Calendar, MapPin, Users } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/courses";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  const booking = ref
    ? await prisma.booking.findFirst({ where: { clientReferenceId: ref } })
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <ChefHat className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Limpopo Chefs Academy
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Success icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Your spot is reserved. A confirmation will be sent to your email.
            </p>
          </div>

          {/* Booking details card */}
          {booking && (
            <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
              <div className="bg-primary px-5 py-4 text-white">
                <p className="text-xs font-medium text-white/70 uppercase tracking-wide mb-0.5">
                  Course
                </p>
                <p className="font-bold text-lg leading-snug">
                  {booking.courseTitle}
                </p>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Campus:</span>
                  <span className="font-medium text-foreground">
                    {booking.campus}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium text-foreground">
                    {formatDate(booking.date)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Participants:</span>
                  <span className="font-medium text-foreground">
                    {booking.participants}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Paid
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(booking.amount / 100)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Confirmation sent to:{" "}
                  <span className="font-medium">{booking.email}</span>
                </p>
              </div>
            </div>
          )}

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-primary text-white rounded-[21px] px-6 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <ChefHat className="w-4 h-4" />
            Book Another Course
          </Link>
        </div>
      </div>
    </div>
  );
}
