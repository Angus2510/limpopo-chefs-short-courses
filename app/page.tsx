"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookingSheet } from "@/components/booking-sheet";
import {
  COURSES,
  CAMPUSES,
  formatPrice,
  type Course,
  type Campus,
} from "@/lib/courses";
import {
  ChefHat,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Users,
} from "lucide-react";

const CATEGORY_GRADIENTS: Record<string, string> = {
  Fundamentals: "from-[#315631] to-[#1e3d1e]",
  Baking: "from-amber-600 to-amber-900",
  Pastry: "from-rose-600 to-rose-900",
  "World Cuisine": "from-orange-500 to-red-800",
  "Dining & Wine": "from-purple-700 to-purple-950",
  "Events & Experiences": "from-teal-600 to-teal-900",
};

// Keep this list updated to control what can be booked right now.
const CURRENTLY_AVAILABLE_COURSE_IDS = new Set<string>([
  "cooking-club-aug", // 3rd Wednesday Cooking Club
]);

const CONFIRMED_TIMES: Record<string, string> = {
  "cooking-club-aug": "17:30",
};

function isCourseAvailable(course: Course) {
  return CURRENTLY_AVAILABLE_COURSE_IDS.has(course.id);
}

function getMonthLabel(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-ZA", {
    month: "long",
    year: "numeric",
  });
}

function getDateParts(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return {
    day: date.toLocaleDateString("en-ZA", { day: "2-digit" }),
    month: date.toLocaleDateString("en-ZA", { month: "short" }).toUpperCase(),
    weekday: date.toLocaleDateString("en-ZA", { weekday: "long" }),
  };
}

type AvailabilityMap = Record<
  string,
  {
    remaining: number;
    campusRemaining?: Record<Campus, number>;
    choiceRemaining?: Record<string, number>;
    choiceCampusRemaining?: Record<string, Record<Campus, number>>;
  }
>;

export default function ShortCoursesPage() {
  const [activeCampus, setActiveCampus] = useState<Campus | "All">("All");
  const [bookingCourse, setBookingCourse] = useState<Course | null>(null);
  const [availability, setAvailability] = useState<AvailabilityMap>({});

  useEffect(() => {
    let mounted = true;

    async function loadAvailability() {
      try {
        const res = await fetch("/api/availability", { cache: "no-store" });
        if (!res.ok) return;

        const data = (await res.json()) as { availability?: AvailabilityMap };
        if (mounted && data.availability) {
          setAvailability(data.availability);
        }
      } catch {
        // Keep static fallback values when the availability endpoint is not reachable.
      }
    }

    loadAvailability();

    return () => {
      mounted = false;
    };
  }, []);

  const visible = COURSES.filter((c) => {
    const campusMatch =
      activeCampus === "All" || c.campuses.includes(activeCampus as Campus);
    return campusMatch;
  });

  const confirmedCourses = visible.filter(
    (course) => isCourseAvailable(course) && course.availableDates.length > 0,
  );

  const tbcCourses = visible.filter(
    (course) =>
      !isCourseAvailable(course) || course.availableDates.length === 0,
  );

  const groupedConfirmedByMonth = confirmedCourses.reduce(
    (acc, course) => {
      const firstDate = [...course.availableDates].sort()[0];
      const key = firstDate.slice(0, 7);
      const label = getMonthLabel(firstDate);

      if (!acc[key]) {
        acc[key] = { label, courses: [] };
      }

      acc[key].courses.push(course);
      return acc;
    },
    {} as Record<string, { label: string; courses: Course[] }>,
  );

  const sections = Object.entries(groupedConfirmedByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      key,
      label: value.label,
      courses: value.courses,
      isTbc: false,
    }));

  if (tbcCourses.length > 0) {
    sections.push({
      key: "tbc",
      label: "To Be Confirmed",
      courses: tbcCourses,
      isTbc: true,
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Limpopo Chefs Academy logo"
              width={180}
              height={70}
              className="h-10 w-auto shrink-0"
              priority
            />
            <div className="leading-none">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                Limpopo Chefs Academy
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Short Courses
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="https://limpopochefs.co.za"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              ← Main Site
            </a>
            <span className="text-primary font-semibold border-b-2 border-primary pb-0.5">
              Short Courses
            </span>
            <a
              href="https://limpopochefs.co.za/contact/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
            <a
              href="/admin"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Admin
            </a>
          </nav>

          {/* Campus pill */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5 shrink-0">
            <MapPin className="w-3 h-3" />
            <span className="hidden sm:inline">Mokopane · Polokwane</span>
          </div>
        </div>
      </header>

      {/* Top campaign banner */}
      <section className="w-full bg-white border-b border-border">
        <div className="relative w-full h-52.5 sm:h-75 md:h-95 lg:h-115 overflow-hidden">
          <Image
            src="/banner.png"
            alt="Limpopo Chefs Academy campaign banner"
            fill
            priority
            className="object-contain object-center"
            sizes="100vw"
          />
        </div>
      </section>

      {/* ── Courses ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Campus filter */}
        <div className="flex items-center gap-2 mb-10">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mr-1">Campus:</span>
          {(["All", ...CAMPUSES] as Array<"All" | Campus>).map((c) => (
            <Button
              key={c}
              variant={activeCampus === c ? "default" : "outline"}
              size="sm"
              className="rounded-[21px]"
              onClick={() => setActiveCampus(c)}
            >
              {c === "All" ? "Both" : c}
            </Button>
          ))}
        </div>

        {sections.map((section) => (
          <section key={section.key} className="mb-10 last:mb-0">
            <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                {section.label}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {section.courses.map((course) => {
                const selectedCampus =
                  activeCampus === "All" ? null : activeCampus;
                const available = isCourseAvailable(course);
                const nextDate = [...course.availableDates].sort()[0] ?? null;
                const dateParts =
                  !section.isTbc && nextDate ? getDateParts(nextDate) : null;
                const timeLabel = CONFIRMED_TIMES[course.id];
                const courseAvailability = availability[course.id];
                const choiceTimeText = course.bookingChoices
                  ?.filter((choice) => choice.timeLabel)
                  .map((choice) => `${choice.label}: ${choice.timeLabel}`)
                  .join(" · ");
                const remainingText = course.bookingChoices?.length
                  ? course.bookingChoices
                      .map((choice) => {
                        const remaining = selectedCampus
                          ? (courseAvailability?.choiceCampusRemaining?.[
                              choice.id
                            ]?.[selectedCampus] ??
                            courseAvailability?.choiceRemaining?.[choice.id] ??
                            choice.maxParticipants ??
                            course.maxParticipants)
                          : (courseAvailability?.choiceRemaining?.[choice.id] ??
                            choice.maxParticipants ??
                            course.maxParticipants);
                        return `${choice.label}: ${remaining} spots left`;
                      })
                      .join(" · ")
                  : `${selectedCampus
                      ? (courseAvailability?.campusRemaining?.[selectedCampus] ??
                        courseAvailability?.remaining ??
                        course.maxParticipants)
                      : (courseAvailability?.remaining ??
                        course.maxParticipants)} spots left`;

                return (
                  <Card
                    key={course.id}
                    className="relative overflow-hidden flex flex-col group hover:shadow-lg transition-shadow duration-300"
                    style={{ "--card-spacing": "0px" } as React.CSSProperties}
                  >
                    {!available && (
                      <Badge className="absolute top-3 right-3 z-10 bg-amber-500 text-white border-amber-400">
                        Coming Soon
                      </Badge>
                    )}

                    {/* Gradient image area */}
                    <div
                      className={`relative h-40 flex items-center justify-center shrink-0 overflow-hidden ${!course.cardImage ? `bg-linear-to-br ${CATEGORY_GRADIENTS[course.category]}` : ""} ${!available ? "saturate-50" : ""}`}
                    >
                      {course.cardImage ? (
                        <Image
                          src={course.cardImage}
                          alt={`${course.title} course image`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        />
                      ) : (
                        <span className="text-6xl drop-shadow select-none">
                          {course.emoji}
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div
                      className={`flex flex-col flex-1 px-4 pt-4 pb-0 ${!available ? "opacity-75 blur-[1px]" : ""}`}
                    >
                      {dateParts ? (
                        <div className="mb-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-primary/80 font-semibold">
                                {dateParts.weekday}
                              </p>
                              <p className="text-2xl font-extrabold text-primary leading-none">
                                {dateParts.day}
                              </p>
                              <p className="text-[11px] uppercase tracking-wide text-primary/80 font-semibold mt-0.5">
                                {dateParts.month}
                              </p>
                            </div>
                            <div className="text-right">
                              {choiceTimeText ? (
                                <>
                                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    Times
                                  </p>
                                  <p className="text-[11px] font-medium text-foreground leading-snug mt-1 max-w-37.5">
                                    {choiceTimeText}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    Start
                                  </p>
                                  <p className="text-base font-bold text-foreground leading-none mt-1">
                                    {timeLabel ?? "TBC"}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : section.isTbc ? (
                        <div className="mb-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                          <p className="text-sm font-medium text-muted-foreground">
                            Schedule to be confirmed
                          </p>
                        </div>
                      ) : (
                        <div className="mb-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                          <p className="text-sm font-medium text-muted-foreground">
                            Dates to be confirmed
                          </p>
                        </div>
                      )}

                      <h3 className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          {course.duration}
                        </span>
                        {available ? (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 shrink-0" />
                            {remainingText}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 shrink-0" />
                            {course.maxParticipants} spots left
                          </span>
                        )}
                      </div>
                      <ScrollArea className="mt-3 h-22 pr-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {course.description}
                        </p>
                      </ScrollArea>
                    </div>

                    {/* Footer */}
                    <div
                      className={`flex items-center justify-between px-4 py-3 mt-3 border-t border-border ${!available ? "opacity-80" : ""}`}
                    >
                      {section.isTbc ? (
                        <p className="text-sm text-muted-foreground">
                          Pricing to be confirmed
                        </p>
                      ) : (
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            From
                          </p>
                          <p className="text-lg font-bold text-primary leading-none">
                            {formatPrice(course.price)}
                          </p>
                        </div>
                      )}
                      <Button
                        size="sm"
                        className="rounded-[21px]"
                        disabled={!available}
                        onClick={() => available && setBookingCourse(course)}
                      >
                        {available ? "Book Now" : "Coming Soon"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-foreground text-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="w-4 h-4 opacity-70" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                  Limpopo Chefs Academy
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                The leading culinary school in Limpopo. Nationally and
                internationally accredited qualifications.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">
                Mokopane Campus
              </h4>
              <div className="space-y-1.5 text-sm text-white/50">
                <p className="flex items-center gap-2">
                  <Phone className="w-3 h-3 shrink-0" /> 015 491 1226
                </p>
                <p className="flex items-center gap-2">
                  <MessageCircle className="w-3 h-3 shrink-0" /> 066 008 6821
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 shrink-0" /> 82 Rabe Street,
                  Mokopane 0600
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">
                Polokwane Campus
              </h4>
              <div className="space-y-1.5 text-sm text-white/50">
                <p className="flex items-center gap-2">
                  <Phone className="w-3 h-3 shrink-0" /> 015 292 0102
                </p>
                <p className="flex items-center gap-2">
                  <MessageCircle className="w-3 h-3 shrink-0" /> 066 245 0458
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 shrink-0" /> 22 Hans van Rensburg
                  Street, Polokwane 0699
                </p>
              </div>
            </div>
          </div>
          <Separator className="bg-white/10 mb-6" />
          <p className="text-xs text-white/30 text-center">
            © {new Date().getFullYear()} Limpopo Chefs Academy · All Rights
            Reserved · Secure payments via Yoco
          </p>
        </div>
      </footer>

      {/* Booking sheet */}
      <BookingSheet
        key={bookingCourse?.id ?? ""}
        course={bookingCourse}
        open={bookingCourse !== null}
        onClose={() => setBookingCourse(null)}
        defaultCampus={activeCampus === "All" ? null : activeCampus}
      />
    </div>
  );
}
