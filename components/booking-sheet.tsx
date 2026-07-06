"use client";

import { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
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

const INPUT =
  "w-full h-9 px-3 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-shadow";

export function BookingSheet({
  course,
  open,
  onClose,
  defaultCampus,
}: BookingSheetProps) {
  const [campus, setCampus] = useState<Campus | null>(defaultCampus ?? null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [participants, setParticipants] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!course) return null;

  const total = course.price * participants;
  const canBook =
    !!campus &&
    !!selectedDate &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleBook() {
    if (!canBook || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course!.id,
          courseTitle: course!.title,
          campus,
          date: selectedDate,
          participants,
          pricePerPerson: course!.price,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
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

          <div className="text-5xl mb-3 leading-none select-none">
            {course.emoji}
          </div>

          <SheetHeader className="p-0 gap-0.5">
            <SheetTitle className="text-white text-xl font-bold leading-snug">
              {course.title}
            </SheetTitle>
            <SheetDescription className="text-white/70 text-sm">
              {course.instructor}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <Badge className="bg-white/20 text-white border-white/30 text-[10px]">
              {course.category}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 text-[10px] flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {course.duration}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 text-[10px] flex items-center gap-1">
              <Users className="w-2.5 h-2.5" />
              Max {course.maxParticipants}
            </Badge>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-5 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {course.description}
            </p>

            <Separator />

            {/* ── Campus selection ── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Select Campus
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(["Mokopane", "Polokwane"] as Campus[]).map((c) => (
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
              <div className="grid grid-cols-2 gap-2">
                {course.availableDates.map((date) => (
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
            </div>

            <Separator />

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
                    setParticipants((p) =>
                      Math.min(course.maxParticipants, p + 1),
                    )
                  }
                  disabled={participants >= course.maxParticipants}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground">
                  (max {course.maxParticipants})
                </span>
              </div>
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
                    Phone Number{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+27 82 XXX XXXX"
                    className={INPUT}
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
                {course.includes.map((item, i) => (
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
                  {formatPrice(course.price)} &times; {participants}{" "}
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
