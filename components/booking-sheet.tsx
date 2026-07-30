"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  type Course,
  type Campus,
  formatPrice,
  formatDate,
} from "@/lib/courses";
import {
  Check,
  Clock,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Shield,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingSheetProps {
  course: Course | null;
  open: boolean;
  onClose: () => void;
  defaultCampus?: Campus | null;
}

type CourseAvailability = {
  remaining: number;
  choiceRemaining?: Record<string, number>;
};

const INPUT =
  "w-full h-9 px-3 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-shadow";

export function BookingSheet({
  course,
  open,
  onClose,
  defaultCampus,
}: BookingSheetProps) {
  const [campus, setCampus] = useState<Campus | null>(
    defaultCampus ??
      (course?.campuses.length === 1 ? course.campuses[0]! : null),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [participants, setParticipants] = useState(1);
  const [bookingChoiceId, setBookingChoiceId] = useState<string | null>(
    course?.bookingChoices?.[0]?.id ?? null,
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availability, setAvailability] = useState<CourseAvailability | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const courseId = course?.id;

  const selectedBookingChoice =
    course?.bookingChoices?.find((choice) => choice.id === bookingChoiceId) ??
    course?.bookingChoices?.[0] ??
    null;
  const pricePerPerson = Number(
    selectedBookingChoice?.price ?? course?.price ?? 0,
  );
  const safePricePerPerson = Number.isFinite(pricePerPerson)
    ? pricePerPerson
    : 0;
  const safeParticipants = Number.isFinite(participants) ? participants : 1;
  const total = safePricePerPerson * safeParticipants;
  const selectedCapacity =
    selectedBookingChoice?.maxParticipants ?? course?.maxParticipants ?? 0;
  const selectedRemaining = Math.max(
    availability
      ? selectedBookingChoice
        ? (availability.choiceRemaining?.[selectedBookingChoice.id] ??
          selectedCapacity)
        : availability.remaining
      : selectedCapacity,
    0,
  );
  const hasDates = (course?.availableDates.length ?? 0) > 0;
  const needsChoice = (course?.bookingChoices?.length ?? 0) > 0;
  const canBook =
    !!course &&
    !!campus &&
    (!needsChoice || !!selectedBookingChoice) &&
    selectedRemaining > 0 &&
    participants <= selectedRemaining &&
    (!hasDates || !!selectedDate) &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    phone.trim().length > 0;

  useEffect(() => {
    const currentCourseId = courseId;
    if (!open || !currentCourseId) return;
    const courseKey: string = currentCourseId;

    let mounted = true;

    async function loadAvailability() {
      setAvailabilityLoading(true);
      try {
        const res = await fetch("/api/availability", { cache: "no-store" });
        if (!res.ok) return;

        const data = (await res.json()) as {
          availability?: Record<string, CourseAvailability>;
        };

        if (mounted) {
          setAvailability(data.availability?.[courseKey] ?? null);
        }
      } catch {
        if (mounted) setAvailability(null);
      } finally {
        if (mounted) setAvailabilityLoading(false);
      }
    }

    loadAvailability();

    return () => {
      mounted = false;
    };
  }, [open, courseId]);

  if (!course) return null;
  const activeCourse = course;

  async function handleBook() {
    if (!canBook || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          courseTitle: selectedBookingChoice
            ? `${course.title} (${selectedBookingChoice.label})`
            : course.title,
          campus,
          date: selectedDate,
          participants,
          pricePerPerson: safePricePerPerson,
          bookingChoiceId: selectedBookingChoice?.id,
          bookingChoiceLabel: selectedBookingChoice?.label,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "Failed to create booking",
        );
      }

      const { redirectUrl } = (await res.json()) as { redirectUrl: string };
      window.location.href = redirectUrl;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="sm:max-w-md p-0 flex flex-col gap-0 overflow-hidden"
        showCloseButton={false}
      >
        {/* ── Green header ── */}
        <div className="relative bg-primary px-5 pt-5 pb-5 text-white shrink-0">
          <SheetClose className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
            <span className="sr-only">Close</span>
          </SheetClose>

          {activeCourse.cardImage ? (
            <div className="relative w-full h-28 mb-3 rounded-xl overflow-hidden bg-white/15 ring-1 ring-white/25">
              <Image
                src={activeCourse.cardImage}
                alt={`${activeCourse.title} image`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 420px"
              />
            </div>
          ) : (
            <div className="text-5xl mb-3 leading-none select-none">
              {activeCourse.emoji}
            </div>
          )}

          <SheetHeader className="p-0 gap-0.5">
            <SheetTitle className="text-white text-xl font-bold leading-snug">
              {activeCourse.title}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <Badge className="bg-white/20 text-white border-white/30 text-[10px] flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {activeCourse.duration}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 text-[10px] flex items-center gap-1">
              <Users className="w-2.5 h-2.5" />
              {selectedRemaining} spots left
            </Badge>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-5 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {activeCourse.description}
            </p>

            <Separator />

            {/* ── Campus selection ── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Select Campus
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(activeCourse.campuses.length > 0
                  ? activeCourse.campuses
                  : (["Mokopane", "Polokwane"] as Campus[])
                ).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCampus(c)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all",
                      campus === c
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    <MapPin className="w-4 h-4" />
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* ── Date selection ── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Choose a Date
              </h3>
              {activeCourse.availableDates.length === 0 ? (
                <div className="bg-muted rounded-lg p-4 text-center space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Dates to be confirmed
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Contact us to register your interest and we’ll notify you
                    when dates are set.
                  </p>
                  <a
                    href="mailto:info@limpopochefs.co.za"
                    className="text-xs text-primary underline underline-offset-2 hover:opacity-80"
                  >
                    info@limpopochefs.co.za
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {activeCourse.availableDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "text-left px-3 py-2.5 rounded-lg border text-xs font-medium transition-all",
                        selectedDate === date
                          ? "border-primary bg-primary text-white"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary",
                      )}
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* ── Booking choice ── */}
            {needsChoice && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Choose Option
                  </h3>
                  <div className="grid gap-2">
                    {activeCourse.bookingChoices!.map((choice) => (
                      <button
                        key={choice.id}
                        onClick={() => setBookingChoiceId(choice.id)}
                        className={cn(
                          "text-left p-3 rounded-xl border transition-all",
                          selectedBookingChoice?.id === choice.id
                            ? "border-primary bg-primary/8"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">
                            {choice.label}
                          </p>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">
                              {formatPrice(choice.price)} pp
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {availability?.choiceRemaining?.[choice.id] ??
                                choice.maxParticipants ??
                                activeCourse.maxParticipants}{" "}
                              spots left
                            </p>
                          </div>
                        </div>
                        {choice.note && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {choice.note}
                          </p>
                        )}
                        {choice.timeLabel && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {choice.timeLabel}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* ── Participants ── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Participants
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setParticipants((p) => Math.max(1, p - 1))}
                  disabled={participants <= 1}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="text-center min-w-10">
                  <span className="text-2xl font-bold text-foreground">
                    {participants}
                  </span>
                  <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    {participants === 1 ? "person" : "people"}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setParticipants((p) => Math.min(selectedRemaining, p + 1))
                  }
                  disabled={
                    participants >= selectedRemaining || selectedRemaining === 0
                  }
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground">
                  ({selectedRemaining} spots left)
                </span>
              </div>
              {selectedRemaining === 0 && (
                <p className="text-xs text-destructive mt-2">
                  This option is sold out.
                </p>
              )}
              {availabilityLoading && (
                <p className="text-xs text-muted-foreground mt-2">
                  Checking availability...
                </p>
              )}
            </div>

            <Separator />

            {/* ── Customer details ── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Your Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Last Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className={INPUT}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className={INPUT}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+27 82 XXX XXXX"
                    className={INPUT}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* ── What's included ── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                What&apos;s Included
              </h3>
              <ul className="space-y-2">
                {activeCourse.includes.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* ── Price summary ── */}
            <div className="bg-muted rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatPrice(pricePerPerson)} &times; {participants}{" "}
                  {participants === 1 ? "person" : "people"}
                </span>
                <span className="font-medium text-foreground">
                  {formatPrice(total)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-end">
                <span className="text-sm font-semibold text-foreground">
                  Total
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer CTA ── */}
        <div className="p-5 border-t border-border bg-card shrink-0">
          {error && (
            <p className="text-xs text-destructive mb-3 text-center">{error}</p>
          )}
          <Button
            className="w-full rounded-[21px] h-12 text-base font-semibold"
            disabled={!canBook || loading}
            onClick={handleBook}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecting to payment…
              </>
            ) : canBook ? (
              `Proceed to Payment · ${formatPrice(total)}`
            ) : (
              "Fill in all details to continue"
            )}
          </Button>
          <p className="flex items-center justify-center gap-1.5 mt-2.5 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            Secure payment via Yoco
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
